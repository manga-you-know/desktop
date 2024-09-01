import { Mark } from './mark';
import { Chapter } from './chapter';

export class Favorite {
  id?: null | number;
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

  constructor(
    id: number | null = null,
    name: string,
    folderName: string,
    cover: string,
    source: string,
    sourceId: string,
    type: string = "manga",
    extraName: string = "",
    titleColor: string = "",
    cardColor: string = "",
    grade: number = 0.0,
    author: string = "Unknow",
    isNotify: boolean = false,
    description: string = "",
    marks: Mark[] = [],
    readeds: Chapter[] = []
  ) {
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