import { conditionalMemoize } from '~/utils/conditionalMemoize';
import { memoizeWithExpiration } from '~/utils/memoizedWithTime';
import type { MangaDl } from '~/interfaces/mangaDl';
import type { AnimeDl } from '~/interfaces/animeDl';
import { Chapter } from '~/models/chapter';
import { Episode } from '../models/episode';
import { MangaSeeDl } from '~/downloaders/manga/mangasee';
import type { Favorite } from '@prisma/client';


export class DownloadManager {
  private mangaSources: { [key: string]: MangaDl } = {};
  private animeSources: { [key: string]: AnimeDl } = {};

  constructor() {
    this.mangaSources = {
      'MangaSee': new MangaSeeDl()
    };
    // this.search = conditionalMemoize(this.search);
    // this.getChapters = memoizeWithExpiration(this.getChapters, 590);
    // this.getEpisodes = memoizeWithExpiration(this.getEpisodes, 590);
    // this.getChapterImages = conditionalMemoize(this.getChapterImages);
    // this.getEpisodeUrls = conditionalMemoize(this.getEpisodeUrls);
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

  async getChapters(favorite: Favorite): Promise<Chapter[]> {
    let sourceDl = this.getMangaSource(favorite.source);
    return await sourceDl.getChapters(favorite.sourceId);
  }

  async getEpisodes(anime_id: string, source: string): Promise<Chapter[]> {
    let sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodes(anime_id);
  }

  async getChapterImages(chapter_id: string, source: string): Promise<string[]> {
    let sourceDl = this.getMangaSource(source);
    return await sourceDl.getChapterImages(chapter_id);
  }
  async getEpisodeUrls(episode_id: string, source: string): Promise<Episode[]> {
    let sourceDl = this.getAnimeSource(source);
    return await sourceDl.getEpisodeUrls(episode_id);
  }
}
