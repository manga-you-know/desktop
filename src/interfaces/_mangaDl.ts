import type { Favorite } from "@/models";
import type { ChaptersResponse } from "./_chaptersResponse";

export interface MangaDl {
  search(query: string): Promise<Favorite[]>;
  getChapters(favoriteID: string): Promise<ChaptersResponse>;
  getChapterImages(chapterID: string): Promise<string[]>;
  getMangaByUrl(url: string): Promise<Favorite>;
  getMangaById(id: string): Promise<Favorite>;
}
