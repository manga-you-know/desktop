import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  var query = getQuery(event);
  const favorites = await db.select(
    'SELECT * FROM Favorite WHERE userID = ? AND isUltraFavorite = ?',
    [query.userId, true],
  );
  return favorites;
});
