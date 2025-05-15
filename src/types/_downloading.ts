import type { Favorite, Chapter } from "@/types";

export type Downloading = {
  fav: Favorite;
  isDownloadingAll: boolean;
  chapters: Chapter[];
  downloadQueue: Chapter[];
  downloading: Chapter[];
};
