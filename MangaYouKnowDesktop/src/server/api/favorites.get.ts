import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const query = getQuery(event);
  if (query.query === undefined) {
    const favorites = await db.select(
      'SELECT * FROM Favorite WHERE userID = ?',
      [query.userId],
    );
    return favorites;
  } else {
    const favorites = await db.select(
      'SELECT * FROM Favorite WHERE userID = ? AND name LIKE "%?%"',
      [query.userId, query.query],
    );
    return favorites;
  }
});
