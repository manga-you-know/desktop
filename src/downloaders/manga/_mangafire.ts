import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { ChaptersResponse, MangaDl } from "@/interfaces";
import { Favorite, Chapter } from "@/models";

export class MangaFireDl implements MangaDl {
  baseUrl = "https://mangafire.to";
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Sec-GPC": "1",
    Connection: "keep-alive",
    Referer: "https://https://mangafire.to",
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
      `${this.baseUrl}/ajax/manga/search?keyword=${query}`,
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const responseJson: { result: { html: string } } = await response.json();
    const $ = cheerio.load(responseJson.result.html);
    const mangas: Favorite[] = [];
    $("a").each((_, a) => {
      const name = $(a).find("h6").text();
      const img = $(a).find("img");
      const link = $(a).attr("href")?.replace("/manga/", "") ?? "";
      const splitedLink = link.split(".");
      const sourceId = splitedLink[splitedLink.length - 1];
      const folderName = splitedLink.slice(0, splitedLink.length - 1).join(".");
      mangas.push(
        new Favorite({
          name: name,
          folder_name: folderName,
          cover: img.attr("src") ?? "/myk.png",
          source: "MangaFire",
          source_id: sourceId,
        })
      );
    });
    return mangas;
  }

  async getChapters(
    mangaId: string,
    language: string = "ja"
  ): Promise<ChaptersResponse> {
    const response = await fetch(
      `${this.baseUrl}/ajax/read/${mangaId}/chapter/${language}`,
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const responseJson: { result: { html: string } } = await response.json();
    const $ = cheerio.load(responseJson.result.html);
    const chapters: Chapter[] = [];
    $("li").each((_, li) => {
      const a = $(li).find("a");
      let title = $(a).attr("title") ?? "";
      if (/u([\da-fA-F]{4})/.test(title)) {
        const uriEncodedText = title.replace(/u([\da-fA-F]{4})/g, "%$1");
        title = decodeURIComponent(uriEncodedText);
      }
      chapters.push(
        new Chapter(
          $(a).attr("data-number") ?? "",
          title,
          $(a).attr("data-id") ?? "",
          "MangaFire"
        )
      );
    });
    return { ok: true, chapters: chapters };
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/ajax/read/chapter/${chapterId}`,
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const responseJson: { result: { images: string[][] } } =
      await response.json();
    return responseJson.result.images.map((image) => image[0]);
  }
}
