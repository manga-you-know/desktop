import Database from "@tauri-apps/plugin-sql";
import { Chapter } from "~/models/chapter";

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event)
  const placeholders = body.chapters.map(() => '(?, ?, ?, ?)').join(', ');
  const values = body.chapters.flatMap((chapter: Chapter) => [
    body.favoriteId,
    chapter.chapterID,
    chapter.source,
    chapter.language,
  ]);
  const readeds = await db.execute(
    `INSERT INTO Readed (favoriteID, chapterID, source, language) VALUES ${placeholders}`,
    values
  );
  return readeds
}); 