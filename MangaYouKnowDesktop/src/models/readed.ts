export class Readed {
  id: number;
  chapterID: string;
  source: string;
  language?: string;
  favoriteID: number;

  constructor(
    id: number,
    chapterID: string,
    source: string,
    language: string = "default",
    favoriteID: number
  ) {
    this.id = id;
    this.chapterID = chapterID;
    this.source = source;
    this.language = language;
    this.favoriteID = favoriteID;
  }
}
