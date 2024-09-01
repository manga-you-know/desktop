import { Favorite } from './favorite';

export class Mark {
  id: number;
  name: string;
  userId: number;
  color?: string;
  favorites: Favorite[];

  constructor(id: number, name: string, userId: number, color?: string, favorites: Favorite[] = []) {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.color = color;
    this.favorites = favorites;
  }
}