import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async () => {
  const db = await Database.load('sqlite:myk.db');
  const users = await db.select('SELECT * FROM User');
  return users
}); 