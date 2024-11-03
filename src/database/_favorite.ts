import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "~/constants";
import type { Favorite, Mark } from "~/models";

export async function createFavorite(
  favorite: Favorite,
  userId?: number,
): Promise<void> {
  if (userId === undefined) {
    return;
  }
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "INSERT INTO favorite (user_id, name, folder_name, cover, link, source, source_id, type, extra_name, title_color, card_color, grade, author, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        favorite.name,
        favorite.folder_name,
        favorite.cover,
        favorite.link,
        favorite.source,
        favorite.source_id,
        favorite.type,
        favorite.extra_name,
        favorite.title_color,
        favorite.card_color,
        favorite.grade,
        favorite.author,
        favorite.description,
      ],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function getFavorite(
  id: number | string | string[],
): Promise<Favorite> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const favorite: Favorite[] = await db.select(
    "SELECT * FROM favorite WHERE id = ? LIMIT 1",
    [id],
  );
  if (favorite) {
    return favorite[0];
  }
  throw new Error("Favorite not found");
}

export async function getFavorites(
  userID: number | undefined,
): Promise<Favorite[]> {
  const favoriteQuery = useState<string>("favoriteQuery", () => "");
  const sourceQuery = useState<string>("sourceQuery", () => "-");
  const order = useState<{ id: string; icon: string }>("order", () => {
    return { id: "asc", icon: "i-heroicons-chevron-up-solid" };
  });
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  let query = "SELECT * FROM favorite WHERE user_id = ? ";
  if (sourceQuery.value !== "-") {
    query += "AND source = ? ";
  }
  if (favoriteQuery.value !== "") {
    query +=
      "AND (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(LOWER(EXTRA_NAME), LOWER(?)) > 0)";
  }
  query += ` ORDER BY id ${order.value.id}`;
  try {
    const favorites: Favorite[] = await db.select(query, [
      userID,
      sourceQuery.value,
      favoriteQuery.value,
      favoriteQuery.value,
    ]);
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getUltraFavorites(
  userID: number | undefined,
): Promise<Favorite[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND is_ultra_favorite = ?",
      [userID, true],
    );
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoritesByMark(
  userID: number | undefined,
  mark: Mark,
): Promise<Favorite[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND id IN (SELECT favorite_id FROM mark_favorites WHERE mark_id = ?)",
      [userID, mark.id],
    );
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoritesByTypes(
  userID: number | undefined,
  types: string[],
): Promise<Favorite[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND type in (?)",
      [userID, types],
    );
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoritesBySource(
  userID: number | undefined,
  source: string,
  query = "",
): Promise<Favorite[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const favorites: Favorite[] =
      query === ""
        ? await db.select(
            "SELECT * FROM favorite WHERE user_id = ? AND source = ?",
            [userID, source],
          )
        : await db.select(
            `
			SELECT * FROM favorite
			WHERE user_id = ?
			AND source = ?
			AND (INSTR(LOWER(NAME), LOWER(?)) > 0
			OR INSTR(LOWER(EXTRA_NAME), LOWER(?)) > 0)
			`,
            [userID, source, query, query],
          );
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoriteSources(
  userID: number | undefined,
): Promise<string[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const sources: string[] = await db.select(
      "SELECT DISTINCT source FROM favorite WHERE user_id = ?",
      [userID],
    );
    //@ts-ignore
    return sources.map((source) => source.source);
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function updateFavorite(favorite: Favorite): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "UPDATE favorite SET name = ?, folder_name = ?, cover = ?, link = ?, source = ?, source_id = ?, type = ?, extra_name = ?, title_color = ?, card_color = ?, grade = ?, author = ?, description = ?, is_ultra_favorite = ? WHERE id = ?",
      [
        favorite.name,
        favorite.folder_name,
        favorite.cover,
        favorite.link,
        favorite.source,
        favorite.source_id,
        favorite.type,
        favorite.extra_name,
        favorite.title_color,
        favorite.card_color,
        favorite.grade,
        favorite.author,
        favorite.description,
        favorite.is_ultra_favorite,
        favorite.id,
      ],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function ultraFavoriteAll(favorites: Favorite[]): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const placeholders = favorites.map(() => "?").join(", ");
    await db.execute(
      `UPDATE favorite SET is_ultra_favorite = 1 WHERE id IN (${placeholders})'`,
      favorites.map((favorite: Favorite) => favorite.id),
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteFavorite(favorite: Favorite): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute("DELETE FROM readed WHERE favorite_id = ?", [favorite.id]);
    await db.execute("DELETE FROM favorite WHERE id = ?", [favorite.id]);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteFavorites(favorites: Favorite[]): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const placeholders = favorites.map(() => "?").join(", ");
    await db.execute(
      `DELETE FROM readed WHERE favorite_id IN (${placeholders})`,
      favorites.map((favorite: Favorite) => favorite.id),
    );
    await db.execute(
      `DELETE FROM favorite WHERE id IN (${placeholders})`,
      favorites.map((favorite: Favorite) => favorite.id),
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
