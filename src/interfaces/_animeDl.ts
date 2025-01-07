import type { Episode } from "@/models";
import type { Favorite, Chapter } from "@/interfaces";

export interface AnimeDl {
  search(query: string): Promise<Favorite[]>;
  getEpisodes(mangaId: string): Promise<Chapter[]>;
  getEpisodeUrls(chapterId: string): Promise<Episode[]>;
}
