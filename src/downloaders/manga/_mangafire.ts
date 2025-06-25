import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Language } from "@/types";
import { LANGUAGE_LABELS } from "@/constants";

export class MangaFireDl implements MangaDl {
  baseUrl = "https://mangafire.to";
  isMultiLanguage = true;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Sec-GPC": "1",
    Connection: "keep-alive",
    Referer: "https://mangafire.to",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    Priority: "u=0, i",
    TE: "trailers",
  };

  getMangaById(id: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
  }

  async getMangaByUrl(url: string): Promise<Favorite> {
    const response = await fetch(url, { headers: this.headers });
    throw new Error(`Failed to found manga in url: ${url}`);
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(
      `${this.baseUrl}/ajax/manga/search?keyword=${query}`
    );
    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const responseJson: { result: { count: number; html: string } } =
      await response.json();
    if (responseJson.result.count === 0) {
      return [];
    }
    const $ = cheerio.load(responseJson.result.html);
    const mangas: Favorite[] = [];
    $("a").each((index, a) => {
      if (index !== responseJson.result.count) {
        const name = $(a).find("h6").text();
        const img = $(a).find("img");
        const link = $(a).attr("href")?.replace("/manga/", "") ?? "";
        const splitedLink = link.split(".");
        const folderName = splitedLink
          .slice(0, splitedLink.length - 1)
          .join(".");
        mangas.push({
          id: 0,
          name: name,
          folder_name: folderName,
          cover: img.attr("src")?.replace("@100", "") ?? "/myk.png",
          source: "MangaFire",
          source_id: link,
          link: `${this.baseUrl}/manga/${link}`,
        });
      }
    });
    return mangas;
  }

  async getFavoriteLanguages(favoriteId: string): Promise<Language[]> {
    const response = await fetch(
      `${this.baseUrl}/manga/${encodeURI(favoriteId)}`,
      {}
    );
    if (response.status !== 200) {
      throw new Error(
        `Failed to get favorite languages ${favoriteId} ${response.status}`
      );
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const languages: Language[] = [];
    $("div.dropdown-menu")
      .filter((_, el) => $(el).attr("class") === "dropdown-menu")
      .first()
      .find("a")
      .each((_, a) => {
        const langID = $(a).attr("data-code")?.toLowerCase() ?? "";
        languages.push({
          id: langID,
          label: LANGUAGE_LABELS[langID] ?? $(a).attr("data-title") ?? "",
        });
      });
    return languages;
  }

  async getChapters(
    mangaId: string,
    language: string = "en"
  ): Promise<Chapter[]> {
    const response = await fetch(
      `${this.baseUrl}/ajax/read/${mangaId.split(".")[1]}/chapter/${language.toLowerCase()}`
    );
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const responseJson: { result: { html: string } } = await response.json();
    const $ = cheerio.load(responseJson.result.html.replaceAll("\\", ""));
    const chapters: Chapter[] = [];
    $("li").each((_, li) => {
      const a = $(li).find("a");
      chapters.push({
        number: a.attr("data-number") ?? "",
        title: a.attr("title") ?? "",
        chapter_id: a.attr("data-id") ?? "",
        source: "MangaFire",
        language: language,
      });
    });
    return chapters;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/ajax/read/chapter/${chapterId}`
    );
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const responseJson: { result: { images: string[][] } } =
      await response.json();
    return responseJson.result.images.map((image) =>
      image[0].replaceAll("\\", "").replace("mfcdn1", "mfcdn2")
    );
  }
}
