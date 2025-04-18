import { memoize } from "lodash";
import { fetch } from "@tauri-apps/plugin-http";
import { mkdir, writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import {
  // MangaDl
  MangaDexDl,
  MangaReaderToDl,
  MangaSeeDl,
  TCBScansDl,
  MangaPillDl,
  TaosectDl,
  MangaFireDl,
  WeebCentralDl,
  MangaLivreDl,
  // ComicDl,
  BatcaveBizDl,
  // AnimeDl
  AniplayDl,
} from "@/downloaders";
import type {
  AnimeDl,
  MangaDl,
  Favorite,
  Chapter,
  Episode,
  Language,
} from "@/interfaces";
import { memoizeExpiring, retry } from "@/utils";
import { invoke } from "@tauri-apps/api/core";

export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  private comicSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {};
  private headers = {
    accept: "*/*",
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
  getChapters;
  constructor() {
    this.mangaSources = {
      TCB: new TCBScansDl(),
      Taosect: new TaosectDl(),
      MangaSee: new MangaSeeDl(),
      MangaDex: new MangaDexDl(),
      MangaPill: new MangaPillDl(),
      MangaFire: new MangaFireDl(),
      MangaReaderTo: new MangaReaderToDl(),
      WeebCentral: new WeebCentralDl(),
      MangaLivre: new MangaLivreDl(),
    };
    this.comicSources = {
      BatcaveBiz: new BatcaveBizDl(),
    };
    this.animeSources = {
      Aniplay: new AniplayDl(),
    };
    this.search = this.search.bind(this);
    this._getChapters = this._getChapters.bind(this);
    this.getEpisodes = this.getEpisodes.bind(this);
    this.getEpisodeContent = this.getEpisodeContent.bind(this);
    this.getChapterImages = this.getChapterImages.bind(this);
    this.getFavoriteLanguages = this.getFavoriteLanguages.bind(this);

    this.search = memoize(this.search, (query, source) => `${query}:${source}`);
    this.getFavoriteLanguages = memoize(this.getFavoriteLanguages);
    this.getChapters = memoizeExpiring(this._getChapters, 600);
    this.getEpisodes = memoizeExpiring(this.getEpisodes, 600);
    this.getChapterImages = memoize(this.getChapterImages);
    this.getEpisodeContent = memoize(this.getEpisodeContent);
    this.getMangaById = memoize(this.getMangaById);
    this.getMangaByUrl = memoize(this.getMangaByUrl);
  }

  getMangaSource(source: string): MangaDl {
    return this.mangaSources[source];
  }

  getComicSource(source: string): MangaDl {
    return this.comicSources[source];
  }

  getAnimeSource(source: string): AnimeDl {
    return this.animeSources[source];
  }

  getImageBasedSource(source: string): MangaDl {
    return this.getMangaSource(source) || this.getComicSource(source);
  }

  getSource(source: string): MangaDl | AnimeDl {
    return (
      (this.getMangaSource(source) || this.getComicSource(source)) ??
      this.getAnimeSource(source)
    );
  }

  getBaseUrl(source: string): string {
    return this.getSource(source).baseUrl;
  }

  isMultiLanguage(source: string): boolean {
    const sourceDl = this.getImageBasedSource(source);
    return sourceDl.isMultiLanguage;
  }

  async getMangaByUrl(url: string, source: string): Promise<Favorite> {
    const sourceDl = this.getMangaSource(source);
    return await sourceDl.getMangaByUrl(url);
  }

  async getMangaById(id: string, source: string): Promise<Favorite> {
    const sourceDl = this.getMangaSource(source);
    return await sourceDl.getMangaById(id);
  }

  async search(query: string, source: string): Promise<Favorite[]> {
    const sourceDl = this.getSource(source);
    return (await sourceDl.search(query)).slice(0, 20);
  }

  async getFavoriteLanguages(favorite: Favorite): Promise<Language[]> {
    const sourceDl = this.getImageBasedSource(favorite.source);
    if (sourceDl.getFavoriteLanguages) {
      return await sourceDl.getFavoriteLanguages(favorite.source_id);
    }
    throw new Error("source not multi language");
  }

  async _getChapters(
    favorite: Favorite,
    language?: string
  ): Promise<Chapter[]> {
    const sourceDl = this.getImageBasedSource(favorite.source);
    try {
      return language !== undefined
        ? await sourceDl.getChapters(favorite.source_id, language)
        : await sourceDl.getChapters(favorite.source_id);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  clearChaptersCache() {
    this.getChapters.clear();
  }

  async getEpisodes(favorite: Favorite): Promise<Chapter[]> {
    const sourceDl = this.getAnimeSource(favorite.source);
    return await sourceDl.getEpisodes(favorite.source_id);
  }

  async getChapterImages(chapter: Chapter): Promise<string[]> {
    const sourceDl = this.getImageBasedSource(chapter.source);
    return await sourceDl.getChapterImages(chapter.chapter_id);
  }

  async getEpisodeContent(chapter: Chapter): Promise<Episode> {
    const sourceDl = this.getAnimeSource(chapter.source);
    return await sourceDl.getEpisodeContent(chapter.chapter_id);
  }

  async getImageContent(
    url: string,
    referer: string
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(url, {
      headers: {
        ...this.headers,
        Referer: referer,
      },
    });
    if (response.status !== 200 || response.body === null) {
      throw new Error(`Failed to get image content ${url} ${response.status}`);
    }
    return response.body;
  }

  isValidBase64Image(base64: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = base64;
    });
  }

  async getBase64Image(url: string, referer: string): Promise<string> {
    const img =
      "data:image/png;base64," +
      (await invoke("get_base64_image", { url: url, referer: referer }));
    if (await this.isValidBase64Image(img)) return img;
    throw Error("Invalid base64 image.");
  }

  async getBase64Images(images: string[], referer: string): Promise<string[]> {
    return await Promise.all(
      images.map((image) => retry(() => this.getBase64Image(image, referer)))
    );
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

  async writePageBase64(imageBase64: string, fileName: string) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    await mkdir("favorite-panels", {
      baseDir: BaseDirectory.Document,
      recursive: true,
    });
    await writeFile("favorite-panels\\" + fileName, bytes, {
      baseDir: BaseDirectory.Document,
    });
  }

  async downloadChapter(chapter: Chapter, favorite: Favorite): Promise<void> {
    const images = await this.getChapterImages(chapter);
    const imagesBase64: string[] = await this.getBase64Images(
      images,
      this.getBaseUrl(chapter.source)
    );
    const chapterPath = `Mangas/${favorite.folder_name}/${chapter.number}`;
    await mkdir(chapterPath, {
      baseDir: BaseDirectory.Download,
      recursive: true,
    });
    imagesBase64.forEach(async (imageBase64, i) => {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      await writeFile(
        `${chapterPath}/${i.toString().padStart(3, "0")}.png`,
        bytes,
        { baseDir: BaseDirectory.Download }
      );
    });
  }
}
