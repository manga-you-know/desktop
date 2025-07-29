import type { Chapter, Favorite, Readed } from "@/types";

export interface FavoriteLoaded {
  self: Favorite;
  readeds: Readed[];
  chapters: Chapter[];
  isLoaded: boolean;
  isLoading: boolean;
  toReadCount: number;
  startLoading: VoidFunction;
  nextChapter: Chapter | null;
  nextImages: string[];
}
