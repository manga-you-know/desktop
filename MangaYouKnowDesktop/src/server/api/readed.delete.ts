import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  const readed = await db.execute(
    'DELETE FROM Readed WHERE id = ? AND favoriteID = ?',
    [body.id, body.userId],
  );
  return readed;
});
