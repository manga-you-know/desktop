export class Mark {
  id: number;
  name: string;
  user_id: number;
  color?: string;

  constructor(id: number, name: string, user_id: number, color?: string) {
    this.id = id;
    this.name = name;
    this.user_id = user_id;
    this.color = color;
  }
}
