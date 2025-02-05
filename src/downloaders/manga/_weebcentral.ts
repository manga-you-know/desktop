import { fetch } from "@tauri-apps/plugin-http";
// import axios from 'axios';
import { memoize } from "lodash";
import * as cheerio from "cheerio";
import type { MangaDl, Favorite, Chapter } from "@/interfaces";

export class WeebCentralDl implements MangaDl {
  baseUrl = "https://weebcentral.com";
  isMultiLanguage = false;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
    // "Accept-Encoding": "gzip, deflate, br",
    "Alt-Used": "www.weebcentral.com",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
  };

  async getMangaById(id: string): Promise<Favorite> {
    // const response = await fetch(`${this.baseUrl}/manga/${id}`, {
    //   headers: this.headers,
    // });
    // if (response.status !== 200) {
    //   throw new Error(`Failed to get manga ${id} ${response.status}`);
    // }
    // const text = await response.text();
    // const $ = cheerio.load(text);
    // const ul = $("ul.list-group.list-group-flush");
    // const name = $(ul).find("h1").text();
    // const description = $(ul).find("div.top-5.Content").text();
    // const author = $(ul).find("a[href^='/search/?author']").text();
    // return {
    //   name: name,
    //   folder_name: name,
    //   cover: `https://temp.compsci88.com/cover/${id}.jpg`,
    //   source: "MangaSee",
    //   source_id: id,
    //   extra_name: "",
    //   link: `${this.baseUrl}/manga/${id}`,
    //   grade: 0,
    //   author: author,
    //   description: description,
    // };
    return {
      name: "test",
      folder_name: "test",
      cover: "https://temp.compsci88.com/cover/test.jpg",
      source: "WeebCentral",
      source_id: "test",
      extra_name: "",
      link: `${this.baseUrl}/manga/test`,
      grade: 0,
    };
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

  // async getMangas(): Promise<Favorite[]> {
  //   const response = await fetch(`${this.baseUrl}/search`, {});
  //   if (response.status !== 200) {
  //     throw new Error(`Failed to get mangas ${response.status}`);
  //   }
  //   const text = await response.text();
  //   var mangaList = JSON.parse(
  //     text.split("vm.Directory = ")[1].split(";\r\n")[0]
  //   );
  //   return mangaList.map((manga: any) => {
  //     return {
  //       name: manga.s,
  //       folder_name: manga.i,
  //       link: `${this.baseUrl}/manga/${manga.i}`,
  //       cover: `https://temp.compsci88.com/cover/${manga.i}.jpg`,
  //       source: "MangaSee",
  //       source_id: manga.i,
  //       extra_name: manga.al[0] || "",
  //       grade: 0,
  //       author: manga.a[0] || "",
  //       description: "",
  //     };
  //   });
  // }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(
      `${this.baseUrl}/search/data?author&text=${encodeURI(
        query
      )}&sort=Best%20Match&order=Ascending&official=Any&display_mode=Full%20Display`,
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
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
        name: $(a).text(),
        source: "WeebCentral",
        source_id: href.split("/").slice(-2, -1)[0],
        cover: $(article).find("source").attr("srcset") || "",
        folder_name: href.split("/").pop()?.toLowerCase() || "",
        extra_name: href.split("/").pop(),
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
      {
        headers: this.headers,
      }
    );
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const chapters: Chapter[] = [];
    const text = await response.text();
    const $ = cheerio.load(text);
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
      {}
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
