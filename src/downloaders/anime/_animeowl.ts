import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";
import { load } from "cheerio";
import type {
  AnimeDl,
  Favorite,
  Chapter,
  Episode,
  Language,
} from "@/interfaces";
import { LANGUAGE_LABELS } from "@/constants";

export class AnimeOwlDl implements AnimeDl {
  baseUrl = "https://animeowl.me";
  isToken = true;
  headers = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    Origin: "https://animeowl.me/",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Referer: "https://animeowl.me/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    TE: "trailers",
  };

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/api/advance-search`, {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": "text/json",
      },
      body: JSON.stringify({
        clicked: false,
        limit: 24,
        page: 0,
        pageCount: 1,
        collectionId: null,
        value: query,
        sortt: 4,
        lang22: 3,
        selected: {
          type: [],
          genre: [],
          year: [],
          country: [],
          season: [],
          status: [],
          sort: [],
          language: [],
        },
        results: [],
        label: "searching ....",
        show2KOnly: null,
      }),
    });
    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const responseJson: { results: any[] } = await response.json();
    return responseJson.results.map((rslt) => {
      return {
        name: rslt.anime_name,
        other_name: rslt.jp_name,
        folder_name: rslt.anime_slug,
        source_id: rslt.anime_slug,
        source: "AnimeOwl",
        cover: this.baseUrl + rslt.image,
        link: `${this.baseUrl}/anime/${rslt.anime_slug}`,
        mal_id: rslt.mal_id,
        type: "anime",
      };
    });
  }

  async getEpisodes(animeId: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/anime/${animeId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to getEpisodes ${response.status}`);
    }
    const episodes: Chapter[] = [];
    const text = await response.text();
    const $ = load(text);
    // I could add dubs here, but its english (dogshit) and I don't really want to work on it.
    $("div.tab-content.mr-15.episode-button:first a").each((_, a) => {
      const title = $(a).attr("title") ?? "";
      episodes.push({
        number: title,
        chapter_id: `${title}<token>${
          $(a).attr("href")?.split("?data=")[1] ?? ""
        }`,
        source: "AnimeOwl",
      });
    });
    return episodes;
  }

  async getEpisodeContent(episodeId: string): Promise<Episode> {
    const response = await fetch(
      "https://whguides.com/wsp/w/w?data=" + episodeId.split("<token>")[1]
    );
    console.log(response.url);
    if (response.status !== 200) {
      throw new Error(`Failed to getEpisodeContent ${response.status}`);
    }
    const text = await response.text();
    const $ = load(text);
    const div = $("#video-player-root");
    const responseFinal = await fetch(
      `https://animeowl.me/direct-link/v2/${div.attr("episodeoriginid")}`
    );
    if (responseFinal.status !== 200) {
      throw new Error(`Failed to getEpisodeContent JSON ${response.status}`);
    }
    const responseJson = await responseFinal.json();
    console.log(`${responseJson.luffy.at(-1)}${div.attr("luffytoken")}`);
    return {
      url: responseJson.luffy.at(-1).url + div.attr("luffytoken"),
    };
  }
}
