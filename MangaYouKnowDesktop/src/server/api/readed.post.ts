import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event)
  const readed = await db.execute(
    'INSERT INTO Readed (favoriteID, chapterID, source, language) VALUES (?, ?, ?, ?)',
    [body.favoriteId, body.chapterId, body.source, body.language]
  );
  return readed
});