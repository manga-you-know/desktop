import { set, get, has, remove, clear, stats } from 'tauri-plugin-cache-api';
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
  Atsumaru,
  MangaFire,
  MangaDexDl,
  MangaReaderToDl,
  TCBScansDl,
  MangaPillDl,
  TaosectDl,
  WeebCentralDl,
  MangaLivreDl,
  MangaParkDl,
  // ComicDl
  BatcaveBizDl,
  // AnimeDl
  AniplayDl,
  AnimeOwlDl,
} from "@/downloaders";
import type { AnimeDl, MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Episode, Language, ComicSource, SearchResult } from "@/types";
import { memoizeExpiring, retry } from "@/utils";
import { load, Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { downloadPath } from "@/store";
import { join } from "@tauri-apps/api/path";

export const sources: Record<string, ComicSource> = {
  Atsumaru: Atsumaru,
  MangaFire: MangaFire,
}

export const downloader = {

  getSource(source: string) {
    if (Object.hasOwn(sources, source)) {
      return sources[source]
    } else {
      throw new Error(`Source ${source} not found`)
    }
  },

  isMultiLanguage(source: string) {
    return this.getSource(source).isMultiLanguage
  },


  clearChaptersCache() {
    console.log("fake clean")
  },

  getBaseUrl(source: string) {
    return this.getSource(source).baseUrl
  },

  async getResultByID(source: string, savedID: string): Promise<Favorite> {
    const key = `${source}-result-${savedID}`
    const cached = await get<Favorite>(key)
    if (cached) return cached
    const result = await this.getSource(source).getMangaById(savedID)
    set(key, result)
    return result
  },

  async search(query: string, source: string, _ = false): Promise<SearchResult[]> {
    const key = `${source}-search-${query}`
    const cached = await get<SearchResult[]>(key)
    if (cached) return cached
    const result = await this.getSource(source).search(query)
    set(key, result)
    return result
  },

  async getChapters(saved: Favorite): Promise<Chapter[]> {
    console.log("Hey")
    const key = `${saved.source}-chapters-${saved.source_id}`
    const cached = await get<Chapter[]>(key)
    console.log("CACHEDD")
    if (cached?.length) return cached
    const chapters = await this.getSource(saved.source).getChapters(saved.source_id)
    if (chapters.length > 0) {
      set(key, chapters, { ttl: 60 })
    }
    return chapters
  },

  async getChapterImages(chapter: Chapter): Promise<string[]> {
    const key = `${chapter.source}-images-${chapter.chapter_id}`
    const cached = await get<string[]>(key)
    if (cached) return cached
    const images = await this.getSource(chapter.source).getChapterImages(chapter.chapter_id)
    set(key, images, { ttl: 30 })
    return images
  },

  isValidBase64Image(base64: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = base64;
    });
  },

  async getBase64Image(url: string, referer: string): Promise<string> {
    const img =
      "data:image/png;base64," +
      (await retry(() =>
        invoke("get_base64_image", { url: url, referer: referer })
      ));
    if (await this.isValidBase64Image(img)) return img;
    throw Error("Invalid base64 image.");
  },

  async getBase64Images(images: string[], referer: string): Promise<string[]> {
    return await Promise.all(
      images.map((image) => retry(() => this.getBase64Image(image, referer)))
    );
  }

}
