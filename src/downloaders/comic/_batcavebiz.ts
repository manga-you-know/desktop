import { fetch } from "@tauri-apps/plugin-http";
import { load } from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter } from "@/types";

export class BatcaveBizDl implements MangaDl {
  baseUrl = "https://batcave.biz";
  isMultiLanguage = false;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    Referer: "https://batcave.biz/",
    "Sec-GPC": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    Connection: "keep-alive",
    Priority: "u=0, i",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    TE: "trailers",
  };

  async getMangaById(mangaId: string): Promise<Favorite> {
    throw new Error("not implemented");
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
      `${this.baseUrl}/search/${query.replace(" ", "-")}`,
      { headers: this.headers }
    );
    if (response.status !== 200) {
      throw new Error(`Failed to get comics ${response.status}`);
    }
    const comics: Favorite[] = [];
    const text = await response.text();
    const $ = load(text);
    $("div.readed.d-flex.short").each((_, div) => {
      const link = $(div).find("a").attr("href") ?? "";
      const id = link.split("/").at(-1)?.replace(".html", "") ?? "";
      const src = this.baseUrl + ($(div).find("img").attr("data-src") ?? "");
      comics.push({
        id: 0,
        name: $(div).find("h2").text(),
        folder_name: id,
        source: "BatcaveBiz",
        source_id: id,
        cover: src,
        link: link,
        type: "comic",
        description: $(div).find("li").first().text(),
      });
    });
    return comics;
  }

  async getChapters(comicId: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/${comicId}.html`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${comicId} ${response.status}`);
    }
    const chapters: Chapter[] = [];
    const text = await response.text();
    const $ = load(text);
    const data = $("div.page__chapters-list")
      .find("script")
      .first()
      .text()
      .replace("window.__DATA__ = ", "")
      .replace(";", "");
    const json = JSON.parse(data);
    json.chapters.forEach(
      (chpt: { download_link: string; title: string; title_en: string }) => {
        const id = chpt.download_link.split("/")?.at(-1)?.split("-").join("/");
        chapters.push({
          number:
            (chpt.title.includes("#")
              ? chpt.title.split("#").at(-1)
              : chpt.title.split(" - ").at(-1)) ?? chpt.title,
          title: chpt.title_en,
          chapter_id: id ?? "",
          source: "BatcaveBiz",
        });
      }
    );
    return chapters;
  }

  async getChapterImages(issueId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/reader/${issueId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      console.log(response.url);
      throw new Error(
        `Failed to get issue images ${issueId} ${response.status}`
      );
    }
    const text = await response.text();
    const $ = load(text);
    const data = $("script")
      .eq(5)
      .text()
      .replace("window.__DATA__ = ", "")
      .replace(";", "");
    const json = JSON.parse(data);
    return json.images;
  }
}
