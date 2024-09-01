export class Chapter {
  id: number | null = null;
  chapterId: string;
  source: string;
  language: string;

  constructor(
    id: number | null = null,
    chapterId: string,
    source: string,
    language: string = "default",
  ) {
    this.id = id;
    this.chapterId = chapterId;
    this.source = source;
    this.language = language;
  }
}