import { conditionalMemoize } from '~/utils/conditionalMemoize';
import { memoizeWithExpiration } from '~/utils/memoizedWithTime';
import type { MangaDl, AnimeDl, ChaptersResponse } from '~/interfaces';
import { Chapter } from '~/models/chapter';
import { Episode } from '../models/episode';
import { MangaSeeDl, MangaDexDl, TCBScansDl, MangaReaderToDl } from '~/downloaders/manga';
import type { Favorite } from '~/models/favorite';


export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {};

  constructor() {
    this.mangaSources = {
      'MangaSee': new MangaSeeDl(),
      'MangaDex': new MangaDexDl(),
      'TCB': new TCBScansDl(),
      'MangaReader.to': new MangaReaderToDl(),
    };
    this.search = this.search.bind(this);
    this.getChapters = this.getChapters.bind(this);
    this.getEpisodes = this.getEpisodes.bind(this);
    this.getChapterImages = this.getChapterImages.bind(this);
    this.getEpisodeUrls = this.getEpisodeUrls.bind(this);

    this.search = conditionalMemoize(this.search);
    this.getChapters = memoizeWithExpiration(this.getChapters, 590);
    this.getEpisodes = memoizeWithExpiration(this.getEpisodes, 590);
    this.getChapterImages = conditionalMemoize(this.getChapterImages);
    this.getEpisodeUrls = conditionalMemoize(this.getEpisodeUrls);
  }

  getMangaSource(source: string): MangaDl  {
    return this.mangaSources[source];
  }

  getAnimeSource(source: string): AnimeDl  {
    return this.animeSources[source];
  }

  async search(query: string, source: string): Promise<Favorite[]> {
    let sourceDl = this.getMangaSource(source) || this.getAnimeSource(source);
    return await sourceDl.search(query);
  }

  async getChapters(favorite: Favorite): Promise<ChaptersResponse> {
    let sourceDl = this.getMangaSource(favorite.source);
    return await sourceDl.getChapters(favorite.source_id);
  }

  async getEpisodes(anime_id: string, source: string): Promise<Chapter[]> {
    let sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodes(anime_id);
  }

  async getChapterImages(chapter: Chapter): Promise<string[]> {
    let sourceDl = this.getMangaSource(chapter.source);
    return await sourceDl.getChapterImages(chapter.chapter_id);
  }
  async getEpisodeUrls(episode_id: string, source: string): Promise<Episode[]> {
    let sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodeUrls(episode_id);
  }
}
