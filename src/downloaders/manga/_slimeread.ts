import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl, Favorite, Chapter } from "@/interfaces";

export class SlimeReadDl implements MangaDl {
  baseUrl = "https://slimeread.com";
  apiUrl = "https://tipaeupapai.slimeread.com:8443";
  isMultiLanguage = false;
  headers = {
    authority: "https://slimeread.com",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    referer: "https://taosect.com/",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  };

  async getMangaById(id: string): Promise<Favorite> {
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
    const response = await fetch(`${this.apiUrl}/book_search?query=${query}`, {
      headers: this.headers,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const json = await response.json();
    return json.map((b: any) => {
      return {
        name: b.book_name_original,
        folder_name: b.book_name,
        cover: b.book_image,
        source: "SlimeRead",
        source_id: b.book_id,
        link: `${this.baseUrl}/manga/${b.book_id}`,
      };
    });
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await fetch(
      `${this.apiUrl}/book_cap_units_all?manga_id=${mangaId}`,
      {
        headers: this.headers,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${response.status}`);
    }
    const json = await response.json();
    return [];
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.apiUrl}/leitor-online/projeto/${chapterId}`,
      {
        headers: this.headers,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get chapter images ${response.status}`);
    }
    return [];
  }
}
