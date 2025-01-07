import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl, Favorite, Chapter, Language } from "@/interfaces";

export class MangaReaderToDl implements MangaDl {
  baseUrl = "https://mangareader.to";
  isMultiLanguage = true;
  headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    dnt: "1",
    priority: "u=0, i",
    referer: "https://mangareader.to/",
    "sec-ch-ua": '"Chromium";v="129", "Not=A?Brand";v="8"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  };

  getMangaById(id: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
  }

  async getMangaByUrl(url: string): Promise<Favorite> {
    return {
      name: "",
      folder_name: "",
      cover: "",
      source: "",
      source_id: "",
      link: "",
    };
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(
      `${this.baseUrl}/search?keyword=${encodeURIComponent(query)}`,
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
      return [];
    }
    const mangas: Favorite[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    const mainDiv = $("div.mls-wrap");
    const chaptersDiv = mainDiv.find("div.item.item-spc");
    chaptersDiv.each((_, div) => {
      const img = $(div).find("img");
      const a = $(div).find("a[title]");
      mangas.push({
        source_id: a.attr("href")?.slice(1) || "",
        name: a.attr("title") || "",
        folder_name: a.attr("href")?.slice(1) || "",
        link: `${this.baseUrl}${a.attr("href")}`,
        cover: img.attr("src") || "",
        source: "MangaReaderTo",
      });
    });

    return mangas;
  }

  async getChapters(mangaId: string, language: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/${mangaId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const chapters: { [key: string]: Chapter[] } = {};
    const text = await response.text();
    const $ = cheerio.load(text);
    const chaptersDiv = $("div.chapters-list-ul").eq(0);
    chaptersDiv.find("li.item.reading-item.chapter-item").each((_, li) => {
      const a = $(li).find("a[title]");
      const id = a.attr("href")?.split("/").slice(-3).join("/") || "";
      const language = id.split("/")[1];
      if (!chapters[language]) {
        chapters[language] = [];
      }
      chapters[language].push({
        number: $(li).attr("data-number") || "",
        title: a.attr("title") || "",
        chapter_id: id || "",
        source: "MangaReaderTo",
        language: language,
      });
    });
    return chapters[language];
  }
  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/read/${chapterId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const chapterJsonId = $("#wrapper").attr("data-reading-id");
    const responseJson = await fetch(
      `${this.baseUrl}/ajax/image/list/chap/${chapterJsonId}?mode=vertical&quality=high&hozPageSize=1`,
      {
        headers: this.headers,
      }
    );
    const text2 = await responseJson.text();
    const $2 = cheerio.load(text2);
    const divs = $2("div[data-url]");
    const chapterImgs: string[] = [];
    divs.each((_, div) => {
      chapterImgs.push(
        $(div).attr("data-url")?.replace(/\\\"/g, "").replace(/\"/g, "") || ""
      );
    });
    return chapterImgs;
  }
}
