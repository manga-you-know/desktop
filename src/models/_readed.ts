export class Readed {
  id: number;
  chapter_id: string;
  source: string;
  language?: string;
  favorite_id: number;

  constructor(
    id: number,
    chapter_id: string,
    source: string,
    language = 'default',
    favorite_id: number,
  ) {
    this.id = id;
    this.chapter_id = chapter_id;
    this.source = source;
    this.language = language;
    this.favorite_id = favorite_id;
  }
}
