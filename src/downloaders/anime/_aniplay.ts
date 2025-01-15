import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";
import * as cheerio from "cheerio";
import type {
  AnimeDl,
  Favorite,
  Chapter,
  Episode,
  Language,
} from "@/interfaces";
import { LANGUAGE_LABELS } from "@/constants";

export class AniplayDl implements AnimeDl {
  baseUrl = "https://aniplaynow.live";
  headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    Origin: "https://aniplaynow.live",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Referer: "https://aniplaynow.live/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    TE: "trailers",
  };
  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`https://graphql.anilist.co/`, {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query:
          "\nquery ($type: MediaType, $search: String, $isAdult: Boolean) {\nPage(perPage: 8) {\npageInfo {\n  total\n  hasNextPage\n}\nresults: media(type: $type, search: $search, isAdult: $isAdult) {\n  id\n  title {\n    romaji\n    english\n  }\n  coverImage {\n    medium\n  }\n  type\n  format\n  nextAiringEpisode {\n    airingAt\n    timeUntilAiring\n    episode\n  }\n  episodes\n  status\n  averageScore\n  genres\n  startDate {\n    year\n  }\n}\n}\n}   \n",
        variables: { search: query, type: "ANIME", isAdult: false },
      }),
    });
    if (response.status !== 200) {
      throw new Error(`Failed to search ${response.status}`);
    }
    const responseJson: { data: { Page: { results: any[] } } } =
      await response.json();
    return responseJson.data.Page.results.map((anime: any) => {
      return {
        name: anime.title.english ? anime.title.english : anime.title.romaji,
        folder_name: anime.title.romaji,
        extra_name: anime.title.english,
        cover: anime.coverImage.medium.replace("small", "medium"),
        source: "Aniplay",
        type: "anime",
        source_id: anime.id.toString(),
        anilist_id: anime.id.toString(),
        link: `${this.baseUrl}/anime/info/${anime.id}`,
      };
    });
  }
  async getEpisodes(animeId: string): Promise<Chapter[]> {
    const response: string = await invoke("get_aniplay_chapters", {
      animeId: animeId,
    });
    const splitParts = response.split("1:");
    const responseJson = await JSON.parse(splitParts[1]);
    const provider = responseJson[1].providerId;
    return responseJson[1].episodes
      .map((episode: any) => {
        return {
          number: episode.number,
          title: episode.title,
          thumbnail: episode.img,
          chapter_id: `${animeId}<o>${provider}<o>${episode.id}`,
          source: "Aniplay",
        };
      })
      .reverse();
  }
  async getEpisodeContent(episodeId: string): Promise<Episode> {
    const params = episodeId.split("<o>");
    const response: string = await invoke("get_aniplay_episode", {
      animeId: params[0],
      providerId: params[1],
      episodeId: params[2],
    });
    const splitedResponse = response.split("1:");
    const responseJson = await JSON.parse(splitedResponse[1]);
    return {
      url: responseJson.sources[0].url,
      subtitles: responseJson.tracks,
      headers: { Referer: "https://animez.org" },
    };
  }
}
