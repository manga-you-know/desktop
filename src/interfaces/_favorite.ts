import type { Chapter } from "./_chapter";
import type { Mark } from "../models/_mark";

export interface Favorite {
  id?: number;
  user_id?: number;
  name: string;
  folder_name: string;
  link: string;
  cover: string;
  source: string;
  source_id: string;
  type?: string;
  extra_name?: string;
  title_color?: string;
  card_color?: string;
  grade?: number;
  author?: string;
  is_ultra_favorite?: boolean;
  description?: string;
  marks?: Mark[];
  readeds?: Chapter[];
}
