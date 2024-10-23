export class Chapter {
  number: number | string;
  title: string;
  chapter_id: string;
  source: string;
  language: string;

  constructor(
    number: number | string,
    title: string = '',
    chapter_id: string,
    source: string,
    language = 'default',
  ) {
    this.number = number;
    this.title = title;
    this.chapter_id = chapter_id;
    this.source = source;
    this.language = language;
  }
}
