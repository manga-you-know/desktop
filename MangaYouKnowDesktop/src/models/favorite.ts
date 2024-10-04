import { Mark } from './mark';
import { Chapter } from './chapter';


export class Favorite {
  id?: number;
  user_id?: number;
  name: string;
  folder_name: string;
  cover: string;
  source: string;
  source_id: string;
  type: string;
  extra_name?: string;
  title_color?: string;
  card_color?: string;
  grade: number;
  author?: string;
  is_ultra_favorite: boolean;
  description?: string;
  marks: Mark[];
  readeds: Chapter[];

  constructor({
    id = -1,
    user_id = -1,
    name = '',
    folder_name = '',
    cover = '',
    source = '',
    source_id = '',
    type = 'manga',
    extra_name = '',
    title_color = '',
    card_color = '',
    grade = 0.0,
    author = 'Unknow',
    is_ultra_favorite = false,
    description = '',
    marks = [],
    readeds = []
  }: {
    id?: number;
    user_id?: number;
    name: string;
    folder_name: string;
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
  }) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.folder_name = folder_name;
    this.cover = cover;
    this.source = source;
    this.source_id = source_id;
    this.type = type;
    this.extra_name = extra_name;
    this.title_color = title_color;
    this.card_color = card_color;
    this.grade = grade;
    this.author = author;
    this.is_ultra_favorite = is_ultra_favorite;
    this.description = description;
    this.marks = marks;
    this.readeds = readeds;
  }
}
