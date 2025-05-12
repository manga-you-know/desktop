import type { Favorite, Chapter } from "@/types";

export type Downloading = {
  fav: Favorite;
  chapters: Chapter[];
  downloadQueue: Chapter[];
  downloading: Chapter[];
};
