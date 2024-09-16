import { Mark } from './mark';
import { Chapter } from './chapter';


export class Favorite {
  id?: number;
  name: string;
  folderName: string;
  cover: string;
  source: string;
  sourceId: string;
  type: string;
  extraName?: string;
  titleColor?: string;
  cardColor?: string;
  grade: number;
  author?: string;
  isNotify: boolean;
  description?: string;
  marks: Mark[];
  readeds: Chapter[];

  constructor({
    id = -1,
    name = '',
    folderName = '',
    cover = '',
    source = '',
    sourceId = '',
    type = 'manga',
    extraName = '',
    titleColor = '',
    cardColor = '',
    grade = 0.0,
    author = 'Unknow',
    isNotify = false,
    description = '',
    marks = [],
    readeds = []
  }: {
    id?: number;
    name: string;
    folderName: string;
    cover: string;
    source: string;
    sourceId: string;
    type?: string;
    extraName?: string;
    titleColor?: string;
    cardColor?: string;
    grade?: number;
    author?: string;
    isNotify?: boolean;
    description?: string;
    marks?: Mark[];
    readeds?: Chapter[];
  }) {
    this.id = id;
    this.name = name;
    this.folderName = folderName;
    this.cover = cover;
    this.source = source;
    this.sourceId = sourceId;
    this.type = type;
    this.extraName = extraName;
    this.titleColor = titleColor;
    this.cardColor = cardColor;
    this.grade = grade;
    this.author = author;
    this.isNotify = isNotify;
    this.description = description;
    this.marks = marks;
    this.readeds = readeds;
  }
}
