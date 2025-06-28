import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "@/constants";
import type { Favorite, Chapter, Readed } from "@/types";

let db: Database = null!;

async function loadDb() {
  db = await Database.load(`sqlite:${DATABASE_NAME}`);
}

export async function createReaded(readed: Readed): Promise<void> {
  if (!db) await loadDb();
  try {
    await db.execute(
      "INSERT INTO readed (favorite_id, chapter_id, source, language) VALUES (?, ?, ?, ?)",
      [
        readed.favorite_id,
        readed.chapter_id,
        readed.source,
        readed.language ?? "default",
      ]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function createReadeds(
  chapters: Chapter[],
  favoriteID?: number
): Promise<void> {
  if (favoriteID === undefined) {
    throw new Error("favoriteID is undefined");
  }
  if (!db) await loadDb();
  try {
    const placeholders = chapters.map(() => "(?, ?, ?, ?)").join(", ");
    const values = chapters.flatMap((chapter: Chapter) => [
      favoriteID,
      chapter.chapter_id,
      chapter.source,
      chapter.language ?? "default",
    ]);
    await db.execute(
      `INSERT INTO readed (favorite_id, chapter_id, source, language) VALUES ${placeholders}`,
      values
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function getLastReaded(
  favorite: Favorite
): Promise<Readed | undefined> {
  if (!db) await loadDb();
  try {
    const readed: Readed[] = await db.select(
      "SELECT * FROM readed WHERE favorite_id = ? ORDER BY id DESC LIMIT 1",
      [favorite.id]
    );
    if (readed) {
      return readed[0];
    }
    return undefined;
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function getReadeds(favorite: Favorite): Promise<Readed[]> {
  if (!db) await loadDb();
  try {
    const readeds: Readed[] = await db.select(
      "SELECT * FROM readed WHERE favorite_id = ?",
      [favorite.id]
    );
    return readeds;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function updateReaded(readed: Readed): Promise<void> {
  if (!db) await loadDb();
  try {
    await db.execute(
      "UPDATE readed SET chapter_id = ?, source = ?, language = ? WHERE id = ?",
      [
        readed.chapter_id,
        readed.source,
        readed.language ?? "default",
        readed.id,
      ]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteReaded(readed: Readed): Promise<void> {
  if (!db) await loadDb();
  try {
    await db.execute("DELETE FROM readed WHERE id = ?", [readed.id]);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteReadeds(readeds: Readed[]): Promise<void> {
  if (!db) await loadDb();
  try {
    const placeholders = readeds.map(() => "?").join(", ");
    const values = readeds.map((readed) => readed.chapter_id);
    await db.execute(
      `DELETE FROM readed WHERE chapter_id IN (${placeholders})`,
      values
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
