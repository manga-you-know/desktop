import type { Chapter, Readed } from "@/interfaces";

export interface FavoriteLoaded {
  readeds: Readed[];
  chapters: Chapter[];
  isLoaded: boolean;
  isLoading: boolean;
  toReadCount: number;
  startLoading: VoidFunction;
  nextChapter: Chapter | null;
}
