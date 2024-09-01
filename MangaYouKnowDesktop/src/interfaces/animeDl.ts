import { Favorite } from '~/models/favorite'
import { Chapter } from '~/models/chapter'
import { Episode } from '~/models/episode'


export interface AnimeDl {
  search(query: string): Promise<Favorite[]>;
  getEpisodes(mangaId: string): Promise<Chapter[]>;
  getEpisodeUrls(chapterId: string): Promise<Episode[]>;
}
