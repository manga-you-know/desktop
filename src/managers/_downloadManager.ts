import { memoize } from "lodash";
import {
  MangaDexDl,
  MangaReaderToDl,
  MangaSeeDl,
  TCBScansDl,
  MangaPillDl,
  TaosectDl,
} from "@/downloaders/manga";
import type { AnimeDl, ChaptersResponse, MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Episode } from "@/models";
import { memoizeExpiring } from "@/utils/memoizedWithTime";

export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {};

  constructor() {
    this.mangaSources = {
      MangaSee: new MangaSeeDl(),
      MangaDex: new MangaDexDl(),
      TCB: new TCBScansDl(),
      MangaReaderTo: new MangaReaderToDl(),
      Taosect: new TaosectDl(),
      MangaPill: new MangaPillDl(),
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
}
