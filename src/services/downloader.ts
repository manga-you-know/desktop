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

  async getResultByID(source: string, savedID: string): Promise<Favorite> {
    const key = `${source}-result-${savedID}`
    const cached = await get<Favorite>(key)
    if (cached) return cached
    const result = await this.getSource(source).getMangaById(savedID)
    set(key, result)
    return result
  },

  async search(source: string, query: string): Promise<SearchResult[]> {
    const key = `${source}-search-${query}`
    const cached = await get<SearchResult[]>(key)
    if (cached) return cached
    const result = await this.getSource(source).search(query)
    set(key, result)
    return result
  },

  async getChapters(source: string, savedID: string): Promise<Chapter[]> {
    const key = `${source}-chapters-${savedID}`
    const cached = await get<Chapter[]>(key)
    if (cached) return cached
    const chapters = await this.getSource(source).getChapters(savedID)
    set(key, chapters)
    return chapters
  },

  async getChapterImages(source: string, chapterID: string): Promise<string[]> {
    const key = `${source}-images-${chapterID}`
    const cached = await get<string[]>(key)
    if (cached) return cached
    const images = await this.getSource(source).getChapterImages(chapterID)
    set(key, images)
    return images
  }

}
