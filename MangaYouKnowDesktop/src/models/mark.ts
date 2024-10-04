export class Mark {
  id: number;
  name: string;
  userID: number;
  color?: string;

  constructor(
    id: number, 
    name: string, 
    userID: number, 
    color?: string
  ) {
    this.id = id;
    this.name = name;
    this.userID = userID;
    this.color = color;
  }
}
