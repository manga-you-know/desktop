import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "~/constants";
import type { Favorite, Mark, MarkFavorites } from "~/models";

export async function createMarkFavorite(
  favorite: Favorite,
  mark: Mark,
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "INSERT INTO mark_favorites (mark_id, favorite_id) VALUES (?, ?) ",
      [mark.id, favorite.id],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function addMarkFavorite(
  favoriteId: number,
  markId: number,
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "INSERT INTO mark_favorites (favorite_id, mark_id) VALUES (?, ?) ",
      [favoriteId, markId],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function addMarkFavorites(
  favorites: Favorite[],
  markId: number | null,
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const values = favorites.map((favorite) => [favorite.id, markId]).flat();
    const placeholder = favorites.map(() => "(?, ?)").join(", ");
    await db.execute(
      `INSERT INTO mark_favorites (favorite_id, mark_id) VALUES ${placeholder}`,
      values,
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function getMarkFavorites(
  favorite: Favorite,
): Promise<MarkFavorites[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const markFavorites: MarkFavorites[] = await db.select(
      "SELECT * FROM mark_favorites WHERE favorite_id = ?",
      [favorite.id],
    );
    return markFavorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function deleteMarkFavorite(
  favorite: Favorite,
  mark: Mark,
): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "DELETE FROM mark_favorites WHERE favorite_id = ? AND mark_id = ?",
      [favorite.id, mark.id],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
