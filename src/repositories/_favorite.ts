import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME, defaultUser } from "@/constants";
import { libraryQuery, libraryOrder, librarySource, libraryTag } from "@/store";
import { MarkDB, UserDB } from "@/repositories";
import type { Favorite, Mark } from "@/types";
import { get } from "svelte/store";
import {
  loadFavoriteChapters,
  refreshFavorites,
  refreshLibrary,
  removeFavorite,
} from "@/functions";
import { getBool } from "@/utils";

let db: Database = null!;

async function loadDb() {
  db = await Database.load(`sqlite:${DATABASE_NAME}`);
}

export async function createFavorite(favorite: Favorite): Promise<Favorite> {
  if (!db) await loadDb();
  const user = await UserDB.getDefaultUser();
  await db.execute(
    "INSERT INTO favorite (user_id, name, folder_name, cover, link, source, source_id, type, extra_name, title_color, card_color, grade, author, description, status, mal_id, anilist_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user.id,
      favorite.name,
      favorite.folder_name,
      favorite.cover,
      favorite.link,
      favorite.source,
      favorite.source_id,
      favorite.type ?? "manga",
      favorite.extra_name,
      favorite.title_color,
      favorite.card_color,
      favorite.grade,
      favorite.author,
      favorite.description,
      favorite.status ?? "",
      favorite.mal_id ?? "",
      favorite.anilist_id ?? "",
    ]
  );
  const results = await db.select<Favorite[]>("SELECT * FROM favorite WHERE source = ? AND source_id = ? LIMIT 1", [favorite.source, favorite.source_id])
  if (results) {
    return results[0]
  } else {
    throw Error("Error adding favorite")
  }

}

export async function createFavoritesFromJson(
  favorites: Favorite[]
): Promise<void> {
  if (!db) await loadDb();
  try {
    const placeholders = favorites
      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");
    await db.execute(
      `INSERT INTO favorite (user_id, name, folder_name, cover, link, source, source_id, type, extra_name, title_color, card_color, grade, author, description) VALUES ${placeholders}`,
      favorites.flatMap((favorite) => [
        defaultUser.id,
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
      ])
    );
  } catch (error) {
    console.log(error);
    throw new Error("Error in createFavoritesFromJson");
  } finally {
    // db.close()
  }
}

export async function getFavorite(
  id: number | string | string[]
): Promise<Favorite> {
  if (!db) await loadDb();
  const favorite: Favorite[] = await db.select(
    "SELECT * FROM favorite WHERE id = ? LIMIT 1",
    [id]
  );
  if (favorite) {
    return favorite[0];
  }
  throw new Error("Favorite not found");
}

export async function getFavoriteBySource(
  sourceId: string,
  source: string
): Promise<Favorite> {
  if (!db) await loadDb();
  const favorite: Favorite[] = await db.select(
    "SELECT * FROM favorite WHERE source_id = ? AND source = ? LIMIT 1",
    [sourceId, source]
  );
  if (favorite) {
    return favorite[0];
  }
  throw new Error("Favorite not found");
}

export async function getLibraryFavorites(): Promise<Favorite[]> {
  if (!db) await loadDb();
  let query = "SELECT * FROM favorite WHERE user_id = ?";
  const params: (string | number | boolean)[] = [defaultUser.id ?? 0];
  const favoriteQuery = get(libraryQuery);

  if (favoriteQuery !== "") {
    query +=
      " AND (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(LOWER(EXTRA_NAME), LOWER(?)) > 0)";
    params.push(favoriteQuery, favoriteQuery);
  }

  const libraryMark = get(libraryTag);

  if (libraryMark !== undefined && libraryMark.id !== -1) {
    query +=
      " AND id IN (SELECT favorite_id FROM mark_favorites WHERE mark_id = ?)";
    params.push(libraryMark.id);
  }
  if (get(librarySource) !== "") {
    query += " AND source = ?";
    params.push(get(librarySource));
  }

  query += ` ORDER BY ${get(libraryOrder)} ASC`;

  try {
    const favorites: Favorite[] = await db.select(query, params);
    if (libraryMark?.id === -1)
      return favorites.filter((f) => f.is_ultra_favorite === "true");
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getRawFavorites(): Promise<Favorite[]> {
  if (!db) await loadDb();
  const favorites: Favorite[] = await db.select(
    "SELECT * FROM favorite WHERE user_id = ?",
    [defaultUser.id]
  );
  return favorites;
}

export async function getUltraFavorites(): Promise<Favorite[]> {
  if (!db) await loadDb();
  try {
    const favorites: Favorite[] = await getRawFavorites();
    return favorites.filter((f) => f.is_ultra_favorite === "true");
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoritesByMark(
  userID: number | undefined,
  mark: Mark
): Promise<Favorite[]> {
  if (!db) await loadDb();
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND id IN (SELECT favorite_id FROM mark_favorites WHERE mark_id = ?)",
      [userID, mark.id]
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
  types: string[]
): Promise<Favorite[]> {
  if (!db) await loadDb();
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND type in (?)",
      [userID, types]
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
  query = ""
): Promise<Favorite[]> {
  if (!db) await loadDb();
  try {
    const favorites: Favorite[] =
      query === ""
        ? await db.select(
          "SELECT * FROM favorite WHERE user_id = ? AND source = ?",
          [userID, source]
        )
        : await db.select(
          `
			SELECT * FROM favorite
			WHERE user_id = ?
			AND source = ?
			AND (INSTR(LOWER(NAME), LOWER(?)) > 0
			OR INSTR(LOWER(EXTRA_NAME), LOWER(?)) > 0)
			`,
          [userID, source, query, query]
        );
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getFavoriteSources(): Promise<string[]> {
  if (!db) await loadDb();
  try {
    const sources: string[] = await db.select(
      "SELECT DISTINCT source FROM favorite WHERE user_id = ?",
      [defaultUser.id]
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
  if (!db) await loadDb();
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
      ]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function isUltraFavorite(favoriteId: number) {
  const result: { is_ultra_favorite: string }[] = await db.select(
    "SELECT is_ultra_favorite FROM favorite WHERE id = ?",
    [favoriteId]
  );
  return getBool(result[0].is_ultra_favorite);
}

export async function toggleUltraFavorite(
  favorite: Favorite,
  refresh: boolean = true
): Promise<boolean> {
  if (!db) await loadDb();
  try {
    await db.execute("UPDATE favorite SET is_ultra_favorite = ? WHERE id = ?", [
      favorite.is_ultra_favorite,
      favorite.id,
    ]);

    const result: { is_ultra_favorite: string }[] = await db.select(
      "SELECT is_ultra_favorite FROM favorite WHERE id = ?",
      [favorite.id]
    );
    if (refresh) {
      refreshFavorites();
      refreshLibrary();
      if (result[0].is_ultra_favorite === "true")
        loadFavoriteChapters(favorite);
    }
    return result[0].is_ultra_favorite === "true";
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    // db.close()
  }
}

export async function ultraFavoriteAll(favorites: Favorite[]): Promise<void> {
  if (!db) await loadDb();
  try {
    const placeholders = favorites.map(() => "?").join(", ");
    await db.execute(
      `UPDATE favorite SET is_ultra_favorite = 1 WHERE id IN (${placeholders})'`,
      favorites.map((favorite: Favorite) => favorite.id)
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteFavorite(favorite: Favorite): Promise<{
  favorite: Favorite;
  markFavorites: { favorite_id: number; mark_id: number }[];
  readed: { favorite_id: number; chapter_id: string }[];
}> {
  if (!db) await loadDb();
  try {
    const markFavorites = await db.select<
      { favorite_id: number; mark_id: number }[]
    >("SELECT favorite_id, mark_id FROM mark_favorites WHERE favorite_id = ?", [
      favorite.id,
    ]);
    const readed = await db.select<
      {
        favorite_id: number;
        chapter_id: string;
        language?: string;
      }[]
    >(
      "SELECT favorite_id, chapter_id, language FROM readed WHERE favorite_id = ?",
      [favorite.id]
    );

    await db.execute(
      `
      BEGIN TRANSACTION;
      DELETE FROM mark_favorites WHERE favorite_id = ?;
      DELETE FROM readed WHERE favorite_id = ?;
      DELETE FROM favorite WHERE id = ?;
      COMMIT;
    `,
      [favorite.id, favorite.id, favorite.id]
    );

    return {
      favorite,
      markFavorites,
      readed,
    };
  } catch (error) {
    console.log(error);
    await db.execute("ROLLBACK;");
    throw error;
  }
}

export async function undoDeleteFavorite(data: {
  favorite: Favorite;
  markFavorites: { favorite_id: number; mark_id: number }[];
  readed: { favorite_id: number; chapter_id: string; language?: string }[];
}): Promise<void> {
  if (!db) await loadDb();
  try {
    await db.execute(
      `
      BEGIN TRANSACTION;
      INSERT INTO favorite (id, user_id, name, folder_name, cover, link, source, source_id, type, extra_name, title_color, card_color, grade, author, description, status, mal_id, anilist_id, is_ultra_favorite) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      ${data.markFavorites.map(() => "INSERT INTO mark_favorites (favorite_id, mark_id) VALUES (?, ?);").join("")}
      ${data.readed.map(() => "INSERT INTO readed (favorite_id, chapter_id, source, language) VALUES (?, ?, ?, ?);").join("")}
      COMMIT;
    `,
      [
        data.favorite.id,
        data.favorite.user_id,
        data.favorite.name,
        data.favorite.folder_name,
        data.favorite.cover,
        data.favorite.link,
        data.favorite.source,
        data.favorite.source_id,
        data.favorite.type,
        data.favorite.extra_name,
        data.favorite.title_color,
        data.favorite.card_color,
        data.favorite.grade,
        data.favorite.author,
        data.favorite.description,
        data.favorite.status,
        data.favorite.mal_id,
        data.favorite.anilist_id,
        data.favorite.is_ultra_favorite,
        ...data.markFavorites.flatMap((mf) => [mf.favorite_id, mf.mark_id]),
        ...data.readed.flatMap((r) => [
          r.favorite_id,
          r.chapter_id,
          data.favorite.source,
          r.language ?? "default",
        ]),
      ]
    );
  } catch (error) {
    console.log(error);
    await db.execute("ROLLBACK;");
    throw error;
  }
}

export async function deleteFavorites(favorites: Favorite[]): Promise<void> {
  if (!db) await loadDb();
  try {
    const placeholders = favorites.map(() => "?").join(", ");
    await db.execute(
      `DELETE FROM mark_favorites WHERE favorite_id IN (${placeholders})`,
      favorites.map((favorite: Favorite) => favorite.id)
    );
    await db.execute(
      `DELETE FROM readed WHERE favorite_id IN (${placeholders})`,
      favorites.map((favorite: Favorite) => favorite.id)
    );
    await db.execute(
      `DELETE FROM favorite WHERE id IN (${placeholders})`,
      favorites.map((favorite: Favorite) => favorite.id)
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
