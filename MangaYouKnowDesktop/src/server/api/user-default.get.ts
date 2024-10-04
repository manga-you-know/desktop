import Database from "@tauri-apps/plugin-sql";
import type { User } from "~/models/user";

export default defineEventHandler(async () => {
  const db = await Database.load('sqlite:myk.db');
  const users: User[] = await db.select('SELECT * FROM User');
  if (users.length === 0) {
    await db.execute(
      'INSERT INTO User (username, email, icon) VALUES (?, ?, ?)',
      ['admin', 'admin@example.com', 'https://cdn.discordapp.com/embed/avatars/0.png']
    );
    const user: User = await db.select('SELECT * FROM User WHERE username = ?', ['admin']);
    return user
  }
  const user: User = users[0]
  return user
}); 