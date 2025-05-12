import type { Chapter, Readed } from "@/types";

export interface FavoriteLoaded {
  readeds: Readed[];
  chapters: Chapter[];
  isLoaded: boolean;
  isLoading: boolean;
  toReadCount: number;
  startLoading: VoidFunction;
  nextChapter: Chapter | null;
}
