import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "@/constants";
import {
  libraryQuery,
  libraryOrder,
  isAscending,
  librarySource,
} from "@/store";
import { UserRepository } from "@/repositories";
import type { Favorite } from "@/interfaces";
import type { Mark, User } from "@/models";
import { get } from "svelte/store";

export async function createFavorite(favorite: Favorite): Promise<void> {
  const user = await UserRepository.getDefaultUser();
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
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
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function createFavoritesFromJson(
  favorites: Favorite[]
): Promise<void> {
  const user = {
    id: 1,
    icon: "",
    username: "",
    email: "",
    password: "",
    is_authenticated: true,
  };
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const placeholders = favorites
      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");
    await db.execute(
      `INSERT INTO favorite (user_id, name, folder_name, cover, link, source, source_id, type, extra_name, title_color, card_color, grade, author, description) VALUES ${placeholders}`,
      favorites.flatMap((favorite) => [
        user.id,
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const user = {
    id: 1,
    icon: "",
    username: "",
    email: "",
    password: "",
    is_authenticated: true,
  };
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  let query = "SELECT * FROM favorite WHERE user_id = ?";
  const params: (string | number | boolean)[] = [user.id ?? 0];
  const favoriteQuery = get(libraryQuery);

  if (favoriteQuery !== "") {
    query +=
      " AND (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(LOWER(EXTRA_NAME), LOWER(?)) > 0)";
    params.push(favoriteQuery, favoriteQuery);
  }

  // if (currentlyMark.value !== "-") {
  //   const markId = await MarkRepository.getMarkId(currentlyMark.value);
  //   query +=
  //     " AND id IN (SELECT favorite_id FROM mark_favorites WHERE mark_id = ?)";
  //   params.push(markId);
  // }
  if (get(librarySource) !== "") {
    query += " AND source = ?";
    params.push(get(librarySource));
  }

  query += ` ORDER BY ${get(libraryOrder)} ${get(isAscending) ? " ASC" : " DESC"}`;

  try {
    const favorites: Favorite[] = await db.select(query, params);
    return favorites;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getRawFavorites(): Promise<Favorite[]> {
  const user = {
    id: 1,
    icon: "",
    username: "",
    email: "",
    password: "",
    is_authenticated: true,
  };
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const favorites: Favorite[] = await db.select(
    "SELECT * FROM favorite WHERE user_id = ?",
    [user.id]
  );
  return favorites;
}

export async function getUltraFavorites(): Promise<Favorite[]> {
  const user = {
    id: 1,
    icon: "",
    username: "",
    email: "",
    password: "",
    is_authenticated: true,
  };
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const favorites: Favorite[] = await db.select(
      "SELECT * FROM favorite WHERE user_id = ? AND is_ultra_favorite = ?",
      [user.id, true]
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
  mark: Mark
): Promise<Favorite[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
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
  const user = {
    id: 1,
    icon: "",
    username: "",
    email: "",
    password: "",
    is_authenticated: true,
  };
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    const sources: string[] = await db.select(
      "SELECT DISTINCT source FROM favorite WHERE user_id = ?",
      [user.id]
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
      ]
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function setUltraFavorite(favorite: Favorite): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute("UPDATE favorite SET is_ultra_favorite = ? WHERE id = ?", [
      favorite.is_ultra_favorite,
      favorite.id,
    ]);
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
      favorites.map((favorite: Favorite) => favorite.id)
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
    await db.execute("DELETE FROM mark_favorites WHERE favorite_id = ?", [
      favorite.id,
    ]);
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
