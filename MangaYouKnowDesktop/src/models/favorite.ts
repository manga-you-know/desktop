import { Mark } from './mark';
import { Chapter } from './chapter';


export class Favorite {
  id?: number;
  userID?: number;
  name: string;
  folderName: string;
  cover: string;
  source: string;
  sourceID: string;
  type: string;
  extraName?: string;
  titleColor?: string;
  cardColor?: string;
  grade: number;
  author?: string;
  isUltraFavorite: boolean;
  description?: string;
  marks: Mark[];
  readeds: Chapter[];

  constructor({
    id = -1,
    userID = -1,
    name = '',
    folderName = '',
    cover = '',
    source = '',
    sourceID = '',
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
    userID?: number;
    name: string;
    folderName: string;
    cover: string;
    source: string;
    sourceID: string;
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
    this.userID = userID;
    this.name = name;
    this.folderName = folderName;
    this.cover = cover;
    this.source = source;
    this.sourceID = sourceID;
    this.type = type;
    this.extraName = extraName;
    this.titleColor = titleColor;
    this.cardColor = cardColor;
    this.grade = grade;
    this.author = author;
    this.isUltraFavorite = isNotify;
    this.description = description;
    this.marks = marks;
    this.readeds = readeds;
  }
}
