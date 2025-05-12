import type { Chapter, Mark } from "@/types";

export interface Favorite {
  id: number;
  user_id?: number;
  name: string;
  folder_name: string;
  link: string;
  cover: string;
  source: string;
  source_id: string;
  type?: "manga" | "comic" | "anime";
  extra_name?: string;
  title_color?: string;
  card_color?: string;
  mal_id?: string;
  anilist_id?: string;
  status?: string;
  grade?: number;
  author?: string;
  is_ultra_favorite?: boolean;
  description?: string;
  marks?: Mark[];
  readeds?: Chapter[];
}
