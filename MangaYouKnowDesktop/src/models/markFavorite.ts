export class MarkFavorites {
  mark_id: number;
  favorite_id: number;

  constructor(mark_id: number, favorite_id: number) {
    this.mark_id = mark_id;
    this.favorite_id = favorite_id;
  }
}
