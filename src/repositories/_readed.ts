import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "@/constants";
import type { Favorite, Chapter, Readed } from "@/interfaces";

export async function createReaded(readed: Readed): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const placeholders = chapters.map(() => "(?, ?, ?, ?)").join(", ");
    const values = chapters.flatMap((chapter: Chapter) => [
      favoriteID,
      chapter.chapter_id,
      chapter.source,
      chapter.language,
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "UPDATE readed SET chapter_id = ?, source = ?, language = ? WHERE id = ?",
      [readed.chapter_id, readed.source, readed.language, readed.id]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteReaded(readed: Readed): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute("DELETE FROM readed WHERE id = ?", [readed.id]);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteReadeds(readeds: Readed[]): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const placeholders = readeds.map(() => "?").join(", ");
    await db.execute(
      `DELETE FROM readed WHERE id IN (${placeholders})`,
      readeds.map((readed: Readed) => {
        return readed.id;
      })
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
