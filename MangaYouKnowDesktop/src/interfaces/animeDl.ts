import { Favorite, Chapter, Episode } from '~/models'


export interface AnimeDl {
  search(query: string): Promise<Favorite[]>;
  getEpisodes(mangaId: string): Promise<Chapter[]>;
  getEpisodeUrls(chapterId: string): Promise<Episode[]>;
}