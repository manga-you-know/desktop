import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  const favorite = await db.execute(
    'INSERT INTO Favorite (userID, name, folderName, cover, source, sourceID, type, extraName, titleColor, cardColor, grade, author, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      body.userId,
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
    ],
  );
  return favorite;
});
