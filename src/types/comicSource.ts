import type { Favorite, Chapter, Language, SavedType, SearchResult } from "@/types";

/**
 * Comic source type, may it be western or oriental
 */
export type ComicSource = {
  baseUrl: string;
  type: SavedType,
  headers?: {},
  isMultiLanguage: boolean;
  search(query: string): Promise<SearchResult[]>;
  getSavedLanguages?(savedID: string): Promise<Language[]>;
  getChapters(savedID: string, language?: string): Promise<Chapter[]>;
  getChapterImages(chapterID: string): Promise<string[]>;
  getMangaByUrl(url: string): Promise<Favorite>;
  getMangaById(id: string): Promise<Favorite>;
}
