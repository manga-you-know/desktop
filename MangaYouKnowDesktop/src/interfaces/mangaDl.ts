import type { Favorite } from "@prisma/client";
import type { Chapter } from "~/models/chapter";



export interface MangaDl {
  search(query: string): Promise<Favorite[]>;
  getChapters(mangaId: string): Promise<Chapter[]>;
  getChapterImages(chapterId: string): Promise<string[]>;
}
