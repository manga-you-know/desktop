import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { ChaptersResponse, MangaDl } from "~/interfaces";
import { Favorite, Chapter } from "~/models";

export class MangaPillDl implements MangaDl {
  baseUrl = "https://mangapill.com";
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Sec-GPC": "1",
    Connection: "keep-alive",
    Referer: "https://mangapill.com/search?q=one+piece&type=&status=",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    Priority: "u=0, i",
    TE: "trailers",
  };

  async getManga(url: string): Promise<Favorite> {
    const response = await fetch(url, { headers: this.headers });
    if (response.status !== 200) {
      throw new Error(`Failed to found manga in url: ${url}`);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const img = $("img");
    const splitedUrl = url.split("/");
    return new Favorite({
      name: $(img).attr("alt") ?? "",
      folder_name: splitedUrl[splitedUrl.length - 1],
      cover: $(img).attr("data-src") ?? "",
      source: "MangaPill",
      source_id: splitedUrl.slice(-2, -1).join("/"),
      description: $("p.text-sm.text--secondary").text(),
    });
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${query}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const mangas: Favorite[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    const divMangas = $(
      "div.my-3.grid.justify-end.gap-3.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5"
    );
    $(divMangas)
      .children("div")
      .each((_, div) => {
        const a = $(div).find("a.relative.block");
        mangas.push(
          new Favorite({
            name: $(div).find("a.mb-2").find("div").text(),
            source_id: a.attr("href")?.replace("/manga/", "") ?? "",
            folder_name: a.attr("href")?.split("/")[2] ?? "",
            cover: $(a).find("img").attr("data-src") ?? "",
            link: `${this.baseUrl}${a.attr("href")}`,
            source: "MangaPill",
          })
        );
      });
    return mangas;
  }

  async getChapters(mangaId: string): Promise<ChaptersResponse> {
    const response = await fetch(`${this.baseUrl}/manga/${mangaId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const chapters: Chapter[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    const divChapters = $("div#chapters");
    console.log(divChapters);
    $(divChapters)
      .find("a")
      .each((_, a) => {
        chapters.push(
          new Chapter(
            $(a).text().split(" ")[1],
            "",
            $(a).attr("href")?.replace("/chapters/", "") ?? "",
            "MangaPill"
          )
        );
      });

    return { ok: true, chapters: chapters };
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/chapters/${chapterId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const chapterImgs: string[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    $("chapter-page").each((_, page) => {
      chapterImgs.push($(page).find("img").attr("data-src") ?? "/myk.svg");
    });
    return chapterImgs;
  }
}
