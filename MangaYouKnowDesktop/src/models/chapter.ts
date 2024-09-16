export class Chapter {
  chNumber: number | string;
  title: string;
  chapterId: string;
  source: string;
  language: string;

  constructor(
    chNumber: number | string,
    title: string,
    chapterId: string,
    source: string,
    language: string = "default",
  ) {
    this.chNumber = chNumber;
    this.title = title;
    this.chapterId = chapterId;
    this.source = source;
    this.language = language;
  }
}