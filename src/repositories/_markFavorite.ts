import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "@/constants";
import type { Mark, MarkFavorites } from "@/types";
import type { Favorite } from "@/interfaces";

export async function createMarkFavorite(
  favorite: Favorite,
  mark: Mark
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "INSERT INTO mark_favorites (mark_id, favorite_id) VALUES (?, ?) ",
      [mark.id, favorite.id]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function addMarkFavorite(
  favorite: Favorite,
  mark: Mark
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "INSERT INTO mark_favorites (favorite_id, mark_id) VALUES (?, ?) ",
      [favorite.id, mark.id]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function addMarkFavorites(
  favorites: Favorite[],
  markId: number | null
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const values = favorites.flatMap((favorite) => [favorite.id, markId]);
    const placeholder = favorites.map(() => "(?, ?)").join(", ");
    await db.execute(
      `INSERT INTO mark_favorites (favorite_id, mark_id) VALUES ${placeholder}`,
      values
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function getMarkFavorites(
  favorite: Favorite
): Promise<MarkFavorites[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const markFavorites: MarkFavorites[] = await db.select(
      "SELECT * FROM mark_favorites WHERE favorite_id = ?",
      [favorite.id]
    );
    return markFavorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function removeMarkFavorite(
  favorite: Favorite,
  mark: Mark
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "DELETE FROM mark_favorites WHERE favorite_id = ? AND mark_id = ?",
      [favorite.id, mark.id]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function removeMarkFavoritesByMark(mark: Mark) {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute("DELETE FROM mark_favorites WHERE mark_id = ?", [mark.id]);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteMarkFavorites(
  favorites: Favorite[],
  markId: number
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const values = favorites.map((favorite) => favorite.id);
    const placeholder = favorites.map(() => "?").join(", ");
    await db.execute(
      `DELETE FROM mark_favorites WHERE mark_id = ? AND favorite_id IN (${placeholder})`,
      [markId, ...values]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
