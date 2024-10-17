import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  const favorite = await db.execute(
    'UPDATE Favorite SET name = ?, folderName = ?, cover = ?, source = ?, sourceID = ?, type = ?, extraName = ?, titleColor = ?, cardColor = ?, grade = ?, author = ?, description = ?, isUltraFavorite = ? WHERE id = ?',
    [
      body.name,
      body.folderName,
      body.cover,
      body.source,
      body.sourceId,
      body.type,
      body.extraName,
      body.titleColor,
      body.cardColor,
      body.grade,
      body.author,
      body.description,
      body.isUltraFavorite,
      body.id,
    ],
  );
  return favorite;
});
