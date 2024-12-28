import { memoize } from "lodash";
import { fetch } from "@tauri-apps/plugin-http";
import { mkdir, writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import {
  MangaDexDl,
  MangaReaderToDl,
  MangaSeeDl,
  TCBScansDl,
  MangaPillDl,
  TaosectDl,
  MangaFireDl,
} from "@/downloaders/manga";
import type { AnimeDl, ChaptersResponse, MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Episode } from "@/models";
import { memoizeExpiring } from "@/utils/memoizedWithTime";

export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {};
  private headers = {
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

  constructor() {
    this.mangaSources = {
      MangaSee: new MangaSeeDl(),
      MangaDex: new MangaDexDl(),
      TCB: new TCBScansDl(),
      MangaReaderTo: new MangaReaderToDl(),
      Taosect: new TaosectDl(),
      MangaPill: new MangaPillDl(),
      MangaFire: new MangaFireDl(),
    };
    this.search = this.search.bind(this);
    this.getChapters = this.getChapters.bind(this);
    this.getEpisodes = this.getEpisodes.bind(this);
    this.getChapterImages = this.getChapterImages.bind(this);
    this.getEpisodeUrls = this.getEpisodeUrls.bind(this);

    this.search = memoize(this.search, (query, source) => `${query}:${source}`);
    this.getChapters = memoizeExpiring(this.getChapters, 600);
    this.getEpisodes = memoizeExpiring(this.getEpisodes, 600);
    this.getChapterImages = memoize(this.getChapterImages);
    this.getEpisodeUrls = memoize(this.getEpisodeUrls);
    this.getMangaById = memoize(this.getMangaById);
    this.getMangaByUrl = memoize(this.getMangaByUrl);
  }

  getMangaSource(source: string): MangaDl {
    return this.mangaSources[source];
  }

  getAnimeSource(source: string): AnimeDl {
    return this.animeSources[source];
  }

  async getMangaByUrl(url: string, source: string): Promise<Favorite> {
    const sourceDl = this.getMangaSource(source) || this.getAnimeSource(source);
    return await sourceDl.getMangaByUrl(url);
  }

  async getMangaById(id: string, source: string): Promise<Favorite> {
    const sourceDl = this.getMangaSource(source) || this.getAnimeSource(source);
    return await sourceDl.getMangaById(id);
  }

  async search(query: string, source: string): Promise<Favorite[]> {
    const sourceDl = this.getMangaSource(source) || this.getAnimeSource(source);
    return await sourceDl.search(query);
  }

  async getChapters(favorite: Favorite): Promise<ChaptersResponse> {
    const sourceDl = this.getMangaSource(favorite.source);
    return await sourceDl.getChapters(favorite.source_id);
  }

  async getEpisodes(anime_id: string, source: string): Promise<Chapter[]> {
    const sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodes(anime_id);
  }

  async getChapterImages(chapter: Chapter): Promise<string[]> {
    const sourceDl = this.getMangaSource(chapter.source);
    return await sourceDl.getChapterImages(chapter.chapter_id);
  }
  async getEpisodeUrls(episode_id: string, source: string): Promise<Episode[]> {
    const sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodeUrls(episode_id);
  }

  async getImageContent(url: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(url, { headers: this.headers });
    if (response.status !== 200 || response.body === null) {
      throw new Error(`Failed to get chapter images ${url} ${response.status}`);
    }
    return response.body;
  }

  async streamToUint8Array(
    stream: ReadableStream<Uint8Array>
  ): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  async downloadChapter(chapter: Chapter, favorite: Favorite): Promise<void> {
    const images = await this.getChapterImages(chapter);
    const imagesContent: ReadableStream<Uint8Array>[] = await Promise.all(
      images.map((image) => this.getImageContent(image))
    );
    const chapterPath = `Mangas/${favorite.folder_name}/${chapter.number}`;
    await mkdir(chapterPath, {
      baseDir: BaseDirectory.Download,
      recursive: true,
    });
    imagesContent.forEach(async (imageContent, i) => {
      const bytes = await this.streamToUint8Array(imageContent);
      await writeFile(
        `${chapterPath}/${i.toString().padStart(3, "0")}.png`,
        bytes,
        {
          baseDir: BaseDirectory.Download,
        }
      );
    });
  }
}
