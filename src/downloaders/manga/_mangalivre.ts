import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl, Favorite, Chapter, Language } from "@/interfaces";
import { LANGUAGE_LABELS } from "@/constants";

export class MangaLivreDl implements MangaDl {
  baseUrl: string = "https://mangalivre.tv";
  isMultiLanguage: boolean = false;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-GPC": "1",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    Priority: "u=0, i",
  };

  async getMangaByUrl(url: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
  }

  async getMangaById(id: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(
      `${this.baseUrl}/?s=${query}&post_type=wp-manga`,
      { headers: this.headers }
    );
    if (response.status !== 200) {
      throw new Error("Failed searching manga with query: " + query);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const result: Favorite[] = [];
    $("div.search-lists")
      .find("div.manga__item")
      .each((_, div) => {
        const divContent = $(div).find("div.manga__content");
        const link = divContent.find("a").attr("href") ?? "";
        const resultId = link.split("/").at(-2) ?? "";
        const splitedSrc = $(div).find("img").attr("src")?.split("/") ?? [];
        // fix url to use a better size, the default is too small
        const betterImage = splitedSrc
          .at(-1)
          ?.split("-")
          .slice(0, -1)
          .join("-");
        const imageFormat = splitedSrc.at(-1)?.split(".").at(-1);
        result.push({
          name: divContent.find("h2").text(),
          source: "MangaLivre",
          source_id: resultId,
          cover: `${this.baseUrl}/${splitedSrc
            .slice(3, -1)
            .join("/")}/${betterImage}.${imageFormat}`,
          folder_name: resultId,
          description: $(div).find("p").text(),
          link: link,
          grade: 0,
        });
      });
    return result;
  }

  async getChapters(favoriteID: string): Promise<Chapter[]> {
    const response = await fetch(
      `${this.baseUrl}/manga/${favoriteID}/ajax/chapters/?t=1`,
      {
        method: "POST",
        headers: this.headers,
      }
    );
    console.log(response.url);
    if (response.status !== 200) {
      throw new Error("Failed getting manga with id: " + favoriteID);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const chapters: Chapter[] = [];
    $("li").each((_, li) => {
      const a = $(li).find("a");
      chapters.push({
        source: "MangaLivre",
        chapter_id: a.attr("href")?.split("/").slice(-3, -1).join("/") ?? "",
        number: a.text().trim().split(" ").at(-1) ?? "",
      });
    });
    return chapters;
  }

  async getChapterImages(chapterID: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/manga/${chapterID}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error("Failed getting images with id: " + chapterID);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const images: string[] = [];
    $("div.chapter-images")
      .find("img")
      .each((_, img) => {
        images.push($(img).attr("src") ?? "");
      });
    return images;
  }
}
