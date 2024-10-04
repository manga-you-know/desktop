import type { Favorite, Chapter } from "~/models";



export interface MangaDl {
  search(query: string): Promise<Favorite[]>;
  getChapters(favoriteID: string): Promise<Chapter[]>;
  getChapterImages(chapterID: string): Promise<string[]>;
}
