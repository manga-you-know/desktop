import type { Favorite, Chapter } from "@/models";
import type { Language } from "@/interfaces";

export interface MangaDl {
  baseUrl: string;
  isMultiLanguage: boolean;
  search(query: string): Promise<Favorite[]>;
  getFavoriteLanguages?(favoriteID: string): Promise<Language[]>;
  getChapters(favoriteID: string, language?: string): Promise<Chapter[]>;
  getChapterImages(chapterID: string): Promise<string[]>;
  getMangaByUrl(url: string): Promise<Favorite>;
  getMangaById(id: string): Promise<Favorite>;
}
