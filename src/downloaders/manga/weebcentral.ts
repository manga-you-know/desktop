import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter } from "@/types";

export class WeebCentralDl implements MangaDl {
  baseUrl = "https://weebcentral.com";
  isMultiLanguage = false;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
    // Accept: "*/*",
    // Host: "weebcentral.com",
    Referer:
      "https://weebcentral.com",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    // "Accept-Encoding": "gzip, deflate, br, zstd",
    "Sec-GPC": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    // Connection: "keep-alive",
    // 'Cookie': 'cf_clearance=LbDFevuKRYdYn5hEtPE5xwwc5KYYQaUIG7obbWqy_GM-1758762111-1.2.1.1-ehfdzBn.Z_ErXtbF1B5KwJWL4I9GYM1JDpnYcioqXqoinqvpdmZ2Vnm5EFhrT6oceYhnIjGGmZwCfmz8LVPNudsulldslXYwsbisJ8tGE9jW0zSnjsEuOWskgODn72PeElj3DaJVFR8FJEhNl3AGeGx34F.bcyS5Vs3xkyGpT0cW_459bsD8Lyolya9NIVdyF_EUWQ5P8opN3ue9Nv03mcY49EEgSMYOrGzIZRoENnM'
  };

  async getMangaById(mangaId: string): Promise<Favorite> {
    const response = await fetch(`${this.baseUrl}/series/${mangaId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to get manga info ${mangaId} ${response.status}`);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const href = $("link[rel=canonical]").attr("href") ?? "";
    const uls = $("ul.flex.flex-col.gap-4");
    return {
      id: 0,
      name: $("h1").first().text(),
      source: "WeebCentral",
      source_id: mangaId,
      cover: $("source").attr("srcset") || "",
      folder_name: href.split("/").pop()?.toLowerCase() || "",
      extra_name: uls.eq(1).find("ul").find("li").text(),
      description: uls.eq(1).find("p").text(),
      author: uls.eq(0).find("a").first().text(),
      link: href,
      grade: 0,
    };
  }

  async getMangaByUrl(url: string): Promise<Favorite> {
    return {
      id: 0,
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
      `${this.baseUrl}/search/data?author&text=${encodeURI(
        query
      )}&sort=Best%20Match&order=Ascending&official=Any&display_mode=Full%20Display`,
      { headers: this.headers }
    );
    if (response.status !== 200) {
      console.log(await response.text(), "coisas")
      throw new Error(`Failed to get mangas ${response.status}`);
    }
    const mangas: Favorite[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    $("article.bg-base-300").each((_, article) => {
      const aList = $(article).find("a");
      const a = aList.eq(1);
      const href = $(a).attr("href") ?? "";
      mangas.push({
        id: 0,
        name: $(a).text(),
        source: "WeebCentral",
        source_id: href.split("/").slice(-2, -1)[0],
        cover: $(article).find("source").attr("srcset") || "",
        folder_name: href.split("/").pop()?.toLowerCase() || "",
        extra_name: href.split("/").pop()?.replace("-", " "),
        author: aList.eq(2).text(),
        link: href,
        grade: 0,
      });
    });
    return mangas;
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await fetch(
      `${this.baseUrl}/series/${mangaId}/full-chapter-list`,
      { headers: this.headers }
    );
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const chapters: Chapter[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
    console.log(text)
    $("div.flex.items-center[x-data]")
      .find("a")
      .each((_, a) => {
        chapters.push({
          number: $(a).find("span").eq(2).text().split(" ").pop() ?? "",
          chapter_id: $(a).attr("href")?.split("/").pop() ?? "",
          source: "WeebCentral",
          language: "default",
        });
      });
    return chapters;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/chapters/${chapterId}/images?is_prev=False&current_page=1&reading_style=long_strip`,
      { headers: this.headers }
    );
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    return $("img")
      .map((_, img) => $(img).attr("src") || "")
      .toArray();
  }
}
