import { memoize } from "lodash";
import { fromByteArray } from "base64-js";
import { fetch } from "@tauri-apps/plugin-http";
import {
  mkdir,
  writeFile,
  BaseDirectory,
  readFile,
} from "@tauri-apps/plugin-fs";
import {
  // MangaDl
  MangaDexDl,
  TCBScansDl,
  TaosectDl,
  WeebCentralDl,
  AtsumaruDl,
  // MangaReaderToDl,
  // MangaSeeDl,
  // MangaPillDl,
  // MangaFireDl,
  // MangaLivreDl,
  // MangaSwatDl,
  // MangaParkDl,
  // ComicDl
  // BatcaveBizDl,
  // AnimeDl
  // AniplayDl,
  // AnimeOwlDl,
} from "@/downloaders";
import type { AnimeDl, MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Episode, Language } from "@/types";
import { memoizeExpiring, retry } from "@/utils";
import { load, Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { downloadPath } from "@/store";
import { get } from "svelte/store";
import { join } from "@tauri-apps/api/path";

export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  /* private comicSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {}; */
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
      MangaDex: new MangaDexDl(),
      // MangaPill: new MangaPillDl(),
      // MangaFire: new MangaFireDl(),
      // MangaReaderTo: new MangaReaderToDl(),
      WeebCentral: new WeebCentralDl(),
      // MangaLivre: new MangaLivreDl(),
      // MangaSwat: new MangaSwatDl(),
      // MangaPark: new MangaParkDl(),
      Atsumaru: new AtsumaruDl(),
    };
    this.search = this.search.bind(this);
    this._getChapters = this._getChapters.bind(this);
    this.getBase64Image = this.getBase64Image.bind(this);
    this.getBase64Images = this.getBase64Images.bind(this);
    this.getChapterImages = this.getChapterImages.bind(this);
    this.getFavoriteLanguages = this.getFavoriteLanguages.bind(this);

    this.search = memoize(
      this.search,
      (query, source, page) => `${query}:${source}:${page}`,
    );
    this.getFavoriteLanguages = memoize(this.getFavoriteLanguages);
    this.getChapters = memoizeExpiring(this._getChapters, 600);
    this.getBase64Image = memoize(this.getBase64Image);
    this.getChapterImages = memoize(this.getChapterImages);
    this.getBase64Images = memoize(this.getBase64Images);
    this.getMangaById = memoize(this.getMangaById);
  }

  getMangaSource(source: string): MangaDl {
    return this.mangaSources[source];
  }

  getImageBasedSource(source: string): MangaDl {
    return this.getMangaSource(source);
  }

  getSource(source: string): MangaDl {
    return this.getMangaSource(source);
  }

  getSources(_type: "manga"): MangaDl[] {
    return Object.values(this.mangaSources);
  }

  getSourcesNames(_type: "manga"): string[] {
    return Object.keys(this.mangaSources);
  }

  getBaseUrl(source: string): string {
    return this.getSource(source).baseUrl;
  }

  isMultiLanguage(source: string): boolean {
    const sourceDl = this.getImageBasedSource(source);
    return sourceDl.isMultiLanguage;
  }

  async getMangaById(id: string, source: string): Promise<Favorite> {
    const sourceDl = this.getMangaSource(source);
    return await retry(() => sourceDl.getMangaById(id));
  }

  async search(
    query: string,
    source: string,
    page: number = 1,
    prefetchOthers = false,
  ): Promise<{
    mangas: Favorite[];
    hasNextPage: boolean;
  }> {
    try {
      const sourceDl = this.getSource(source);
      const results = await sourceDl.search(query, page);
      // if (prefetchOthers) this.prefetchSearch(query, source);
      return results;
    } catch (e) {
      console.log(e);
      return {
        mangas: [],
        hasNextPage: false,
      };
    }
  }

  async prefetchSearch(query: string, sourceToExclude: string) {
    const sourceNames = this.getSourcesNames("manga");
    for (let source of sourceNames) {
      if (source === sourceToExclude) continue;
      this.search(query, source);
    }
  }

  async getFavoriteLanguages(favorite: Favorite): Promise<Language[]> {
    const sourceDl = this.getImageBasedSource(favorite.source);
    return await retry(
      () => sourceDl.getFavoriteLanguages!(favorite.source_id),
      "Source not multilanguage",
    );
  }

  private async _getChapters(
    favorite: Favorite,
    language?: string,
  ): Promise<Chapter[]> {
    try {
      const sourceDl = this.getImageBasedSource(favorite.source);
      return language !== undefined
        ? await retry(() => sourceDl.getChapters(favorite.source_id, language))
        : await retry(() => sourceDl.getChapters(favorite.source_id));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  clearChaptersCache() {
    this.getChapters.clear();
  }

  async getChapterImages(chapter: Chapter): Promise<string[]> {
    try {
      const sourceDl = this.getImageBasedSource(chapter.source);
      return await retry(() => sourceDl.getChapterImages(chapter.chapter_id));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async getImageContent(
    url: string,
    referer: string,
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await retry(() =>
      fetch(url, {
        headers: {
          ...this.headers,
          Referer: referer,
        },
      }),
    );
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
      (await retry(() =>
        invoke("get_base64_image", { url: url, referer: referer }),
      ));
    if (await this.isValidBase64Image(img)) return img;
    throw Error("Invalid base64 image.");
  }

  async getBase64Images(images: string[], referer: string): Promise<string[]> {
    return await Promise.all(
      images.map((image) => retry(() => this.getBase64Image(image, referer))),
    );
  }

  async streamToUint8Array(
    stream: ReadableStream<Uint8Array>,
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
    const path = await join("favorite-panels", fileName);
    await writeFile(path, bytes, {
      baseDir: BaseDirectory.Document,
    });
  }

  async _pathToBase64(imagePath: string): Promise<string> {
    try {
      const bytes = await readFile(imagePath);
      console.log(fromByteArray(bytes));
      return "";
    } catch (error) {
      console.log(imagePath, "FODASSE");
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  async joinBase64Images(
    base64Image1: string,
    base64Image2: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img1 = new Image();
      const img2 = new Image();
      img1.onload = () => {
        img2.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          const newWidth = img1.width + img2.width;
          const newHeight = Math.max(img1.height, img2.height);
          canvas.width = newWidth;
          canvas.height = newHeight;
          // Draw images side by side
          ctx.drawImage(img2, 0, 0);
          ctx.drawImage(img1, img2.width, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        };

        img2.onerror = () => reject(new Error("Failed to load second image"));
        img2.src = base64Image2;
      };

      img1.onerror = () => reject(new Error("Failed to load first image"));
      img1.src = base64Image1;
    });
  }

  async joinBase64ImagesList(base64Images: string[]): Promise<string[]> {
    if (base64Images.length === 1) {
      return base64Images;
    }

    const newB64Images: string[] = [];
    let count = 0;

    while (count !== base64Images.length) {
      if (count === base64Images.length - 1) {
        newB64Images.push(base64Images[count]);
        break;
      }

      if (count === 0) {
        newB64Images.push(base64Images[count]);
        count++;
        continue;
      }

      const img1 = new Image();
      const img2 = new Image();

      await new Promise<void>((resolve, reject) => {
        img1.onload = () => {
          img2.onload = () => {
            if (img1.width > img1.height || img2.width > img2.height) {
              newB64Images.push(base64Images[count]);
              count++;
              resolve();
              return;
            }

            this.joinBase64Images(base64Images[count], base64Images[count + 1])
              .then((newImg) => {
                newB64Images.push(newImg);
                count += 2;
                resolve();
              })
              .catch(reject);
          };
          img2.src = base64Images[count + 1];
        };
        img1.src = base64Images[count];
      });
    }

    return newB64Images;
  }

  async downloadChapter(
    chapter: Chapter,
    favorite: Favorite,
    store: Store = null!,
  ): Promise<void> {
    if (!store)
      store = await load(`Mangas/${favorite.folder_name}/chapters.json`);
    const images = await this.getChapterImages(chapter);
    const imagesBase64: string[] = await this.getBase64Images(
      images,
      this.getBaseUrl(chapter.source),
    );
    let chapterPath = `Mangas/${favorite.folder_name}/${chapter.number}`;
    if (get(downloadPath) === "Mangas/") {
      await mkdir(chapterPath, {
        baseDir: BaseDirectory.Download,
        recursive: true,
      });
    } else {
      chapterPath = `${get(downloadPath)}/${favorite.folder_name}/${chapter.number}`;
      await mkdir(chapterPath, {
        recursive: true,
      });
    }
    imagesBase64.forEach(async (imageBase64, i) => {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      if (get(downloadPath) === "Mangas/") {
        await writeFile(
          `${chapterPath}/${i.toString().padStart(3, "0")}.png`,
          bytes,
          { baseDir: BaseDirectory.Download },
        );
      } else {
        await writeFile(
          `${chapterPath}/${i.toString().padStart(3, "0")}.png`,
          bytes,
        );
      }
    });
    chapter.path = chapterPath;
    await store.set(chapter.number.toString(), chapter);
  }
}
