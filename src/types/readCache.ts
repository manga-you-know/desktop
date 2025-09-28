import type { Chapter, Favorite } from "@/types";

export type ReadCache = {
  favorite: Favorite;
  chapter: Chapter;
  currentPage: number;
  totalPage: number;
}
