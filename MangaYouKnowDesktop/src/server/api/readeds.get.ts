import Database from '@tauri-apps/plugin-sql';
import type { Readed } from '~/models';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const query = getQuery(event);
  const readeds: Readed[] = await db.select(
    'SELECT * FROM Readed WHERE favoriteID = ?',
    [query.favoriteId],
  );
  return readeds;
});
