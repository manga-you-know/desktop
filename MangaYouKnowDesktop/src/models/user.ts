export class User {
  id?: number;
  email?: string;
  username: string;
  icon?: string;
  password?: string;
  is_authenticated?: boolean;

  constructor(
    id: number = -1,
    username: string,
    email?: string,
    icon: string = "https://cdn.discordapp.com/embed/avatars/0.png",
    password: string = "",
    is_authenticated: boolean = false
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.icon = icon;
    this.password = password;
    this.is_authenticated = is_authenticated;
  }
}
