import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Language } from "@/types";

export class TaosectDl implements MangaDl {
  baseUrl = "https://taosect.com";
  isMultiLanguage = false;
  headers = {
    authority: "taosect.com",
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
  getMangaById(id: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
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
    const response = await fetch(`${this.baseUrl}/?s=${query}`, {
      headers: this.headers,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }

    const text = await response.text();
    const $ = cheerio.load(text);
    const mangas: Favorite[] = [];
    const posts = $("div.post-list article.post-projeto");

    posts.each((_, article) => {
      const a = $(article).find("a");
      const coverStyle = $(article).find("div").attr("style") || "";
      mangas.push({
        id: 0,
        source_id: a.attr("href")?.split("/").slice(-2, -1)[0] || "",
        name:
          a
            .attr("href")
            ?.split("/")
            .slice(-2, -1)[0]
            .replace(/-/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()) || "",
        folder_name: a.attr("href")?.split("/").slice(-2, -1)[0] || "",
        cover: coverStyle.match(/url\((.*?)\)/)?.[1] || "",
        link: a.attr("href") || "",
        source: "Taosect",
      });
    });

    return mangas;
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/projeto/${mangaId}`, {
      headers: this.headers,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get chapters ${response.status}`);
    }

    const text = await response.text();
    const $ = cheerio.load(text);
    const chapters: Chapter[] = [];
    const tds = $('td[align="left"]');
    tds.each((_, td) => {
      const a = $(td).find("a");
      const href = a.attr("href");
      const text = a.text().replace(/\t/g, "");
      const chpt = text.split(" ")[1] ?? "0"
      const id = href?.split("/")?.slice(-3, -1)?.join("/") ?? "";
      if (!chapters.find(chp => chp.chapter_id === id || chp.number === chpt)) {
        chapters.push({
          number: chpt,
          title: text,
          chapter_id: id,
          source: "Taosect",
          language: "default",
        });
      }
    });
    chapters.reverse();
    return chapters;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/leitor-online/projeto/${chapterId}`,
      {
        headers: this.headers,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get chapter images ${response.status}`);
    }

    const text = await response.text();
    const $ = cheerio.load(text);
    const urls: string[] = [];
    const options = $("#leitor_pagina_projeto option");

    options.each((_, option) => {
      urls.push($(option).attr("value") || "");
    });

    return urls;
  }
}
