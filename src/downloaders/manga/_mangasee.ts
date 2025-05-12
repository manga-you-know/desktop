import { fetch } from "@tauri-apps/plugin-http";
// import axios from 'axios';
import { memoize } from "lodash";
import * as cheerio from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Language } from "@/types";

export class MangaSeeDl implements MangaDl {
  baseUrl = "https://mangasee123.com";
  isMultiLanguage = false;
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
    "Accept-Encoding": "gzip, deflate, br",
    "Alt-Used": "www.mangasee123.com",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
  };

  constructor() {
    this.getMangas = memoize(this.getMangas);
  }

  async getMangaById(id: string): Promise<Favorite> {
    const response = await fetch(`${this.baseUrl}/manga/${id}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to get manga ${id} ${response.status}`);
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const ul = $("ul.list-group.list-group-flush");
    const name = $(ul).find("h1").text();
    const description = $(ul).find("div.top-5.Content").text();
    const author = $(ul).find("a[href^='/search/?author']").text();
    return {
      id: 0,
      name: name,
      folder_name: name,
      cover: `https://temp.compsci88.com/cover/${id}.jpg`,
      source: "MangaSee",
      source_id: id,
      extra_name: "",
      link: `${this.baseUrl}/manga/${id}`,
      grade: 0,
      author: author,
      description: description,
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

  async getMangas(): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/search`, {});
    if (response.status !== 200) {
      throw new Error(`Failed to get mangas ${response.status}`);
    }
    const text = await response.text();
    var mangaList = JSON.parse(
      text.split("vm.Directory = ")[1].split(";\r\n")[0]
    );
    return mangaList.map((manga: any) => {
      return {
        name: manga.s,
        folder_name: manga.i,
        link: `${this.baseUrl}/manga/${manga.i}`,
        cover: `https://temp.compsci88.com/cover/${manga.i}.jpg`,
        source: "MangaSee",
        source_id: manga.i,
        extra_name: manga.al[0] || "",
        grade: 0,
        author: manga.a[0] || "",
        description: "",
      };
    });
  }

  async search(query: string): Promise<Favorite[]> {
    const unsortedMangas = await this.getMangas();
    if (unsortedMangas.length === 0) {
      throw new Error("empty");
    }
    const mangasWithGrade: { grade: number; manga: Favorite }[] = [];
    unsortedMangas.forEach((manga) => {
      let grade = 0;
      manga.name.toLowerCase().includes(query.toLowerCase()) ? grade++ : grade;
      manga.name.toLowerCase() === query.toLowerCase() ? (grade += 3) : grade;
      manga.name.toLowerCase().startsWith(query.toLowerCase())
        ? (grade += 2)
        : grade;
      manga.extra_name?.toLowerCase().includes(query.toLowerCase())
        ? (grade += 0.5)
        : grade;
      manga.extra_name?.toLowerCase().startsWith(query.toLowerCase())
        ? (grade += 0.5)
        : grade;
      manga.author?.toLowerCase().includes(query.toLowerCase())
        ? (grade += 0.5)
        : grade;
      if (grade > 0) {
        mangasWithGrade.push({ grade: grade, manga: manga });
      }
    });
    const sortedMangas = mangasWithGrade
      .sort((a, b) => b.grade - a.grade)
      .map((obj) => {
        const manga = obj.manga;
        manga.grade = 0;
        manga.author = manga.author !== "" ? manga.author : "Unknow";
        manga.extra_name =
          manga.extra_name !== "" ? manga.extra_name : "Unknow";
        return obj.manga;
      });
    return sortedMangas;
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/manga/${mangaId}`, {});
    //@ts-ignore
    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${mangaId} ${response.status}`);
    }
    const chapters: Chapter[] = [];
    const text = await response.text();
    var chapterList = JSON.parse(
      text.split("vm.Chapters = ")[1].split(";\r\n")[0]
    );
    chapterList.forEach((chpt: any) => {
      const lastIndex = chpt.Chapter.length - 1;
      let index = "";
      if (chpt.Chapter.charAt(0) != "1") {
        index = `-index-${chpt.Chapter.charAt(0)}`;
      }
      const number =
        chpt.Chapter.charAt(lastIndex) == "0"
          ? `${Number.parseInt(chpt.Chapter.substring(1, lastIndex))}`
          : `${Number.parseInt(
              chpt.Chapter.substring(1, lastIndex)
            )}.${chpt.Chapter.charAt(lastIndex)}`;
      chapters.push({
        number: number,
        title: chpt.ChapterName,
        chapter_id: `${mangaId}-chapter-${number}${index}-page-1.html`,
        source: "MangaSee",
        language: "default",
      });
    });
    return chapters;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/read-online/${chapterId}`,
      {}
    );
    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }
    const text = await response.text();
    const dominy = text.split('vm.CurPathName = "')[1].split('"')[0];
    const manga_id = text.split('vm.IndexName = "')[1].split('"')[0];
    const manga_info = JSON.parse(
      text.split("vm.CurChapter = ")[1].split("\n")[0].slice(0, -2)
    );

    const directory = manga_info.Directory;
    const num_pages = Number.parseInt(manga_info.Page.toString(), 10); // Ensure number type
    const chapter =
      manga_info.Chapter.slice(1, -1) +
      (manga_info.Chapter.slice(-1) === "0"
        ? ""
        : `.${manga_info.Chapter.slice(-1)}`);

    const chapter_imgs: string[] = [];

    for (let page = 1; page <= num_pages; page++) {
      const num = page.toString().padStart(3, "0");
      chapter_imgs.push(
        `https://${dominy}/manga/${manga_id}/${directory}/${chapter}-${num}.png`
      );
    }

    return chapter_imgs;
  }
}
