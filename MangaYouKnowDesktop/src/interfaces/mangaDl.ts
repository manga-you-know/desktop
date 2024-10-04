import type { Favorite, Chapter } from "~/models";



export interface MangaDl {
  search(query: string): Promise<Favorite[]>;
  getChapters(mangaId: string): Promise<Chapter[]>;
  getChapterImages(chapterId: string): Promise<string[]>;
}
