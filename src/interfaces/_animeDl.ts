import type { Favorite, Chapter, Episode } from "@/interfaces";

export interface AnimeDl {
  baseUrl: string;
  search(query: string): Promise<Favorite[]>;
  getEpisodes(animeId: string): Promise<Chapter[]>;
  getEpisodeContent(chapterId: string): Promise<Episode>;
}
