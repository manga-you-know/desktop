import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  const favorite = await db.execute(
    'DELETE FROM Favorite WHERE id = ? AND userID = ?',
    [body.id, body.userId],
  );
  await db.execute('DELETE FROM Readed WHERE favoriteID = ?', [body.id]);
  return favorite;
});
