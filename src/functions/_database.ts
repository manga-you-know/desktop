import {
  FavoriteDB,
  ReadedDB,
  DATABASE_INIT,
  DATABASE_MIGRATION,
  MarkDB,
} from "@/repositories";
import { DATABASE_NAME } from "@/constants";
import Database from "@tauri-apps/plugin-sql";
import {
  tags,
  favoritesLoaded,
  libraryFavorites,
  panels,
  readeds,
  ultraFavorites,
} from "@/store";
import type { Favorite, Chapter, Readed } from "@/types";
import {
  BaseDirectory,
  exists,
  readDir,
  type DirEntry,
} from "@tauri-apps/plugin-fs";
import { documentDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import { removeFavorite } from "@/functions/_favorite";

let db: Database = null!;

async function loadDb() {
  db = await Database.load(`sqlite:${DATABASE_NAME}`);
}

async function ensureConnected() {
  if (!db) await loadDb();
}

export async function initDatabase() {
  await ensureConnected();
  try {
    await db.execute(DATABASE_INIT);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function migrateDatabase() {
  await ensureConnected();

  try {
    const databaseInfo: { name: string }[] = await db.select(
      "PRAGMA table_info(favorite);"
    );
    const columns = databaseInfo.map((column) => column.name);
    for (const migration of DATABASE_MIGRATION) {
      if (columns.includes(migration.name)) continue;
      await db.execute(
        `ALTER TABLE favorite ADD COLUMN ${migration.name} ${migration.type} DEFAULT "?";`,
        [migration.default]
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export function isReaded(chapter: Chapter, readeds: Readed[]) {
  return readeds.find(
    (r) =>
      r.chapter_id === chapter.chapter_id && r?.language == chapter?.language
  );
}

export async function isFavorite(favorite: Favorite): Promise<boolean> {
  const rawFavs = await FavoriteDB.getRawFavorites();
  return rawFavs.some(
    (fav) =>
      fav.source_id === favorite.source_id || fav.source === favorite.source
  );
}

export async function addReadedBelow(
  chapter: Chapter,
  chapters: Chapter[],
  favorite: Favorite,
  readeds?: Readed[],
  dontDelete?: boolean
) {
  const localReadeds = readeds ?? (await ReadedDB.getReadeds(favorite));
  const readed = isReaded(chapter, localReadeds);
  if (readed) {
    if (!dontDelete) {
      await deleteReadedAbove(readed, chapters, localReadeds);
    }
    return;
  }
  const toAdd = [];
  let isForAdd = false;
  for (const chapterI of chapters) {
    if (chapterI.chapter_id === chapter.chapter_id) isForAdd = true;
    if (isForAdd) if (!isReaded(chapterI, localReadeds)) toAdd.push(chapterI);
  }
  await ReadedDB.createReadeds(toAdd, favorite.id);
}

export async function deleteReadedAbove(
  readed: Readed,
  chapters: Chapter[],
  readeds: Readed[]
) {
  const toDelete: Readed[] = [];
  let isForDelete = false;
  for (const chapter of [...chapters].reverse()) {
    if (chapter.chapter_id === readed.chapter_id) isForDelete = true;
    if (isForDelete) {
      const read = isReaded(chapter, readeds);
      if (read) toDelete.push(read);
    }
  }
  await ReadedDB.deleteReadeds(toDelete);
}

export async function refreshLibrary() {
  const favs = await FavoriteDB.getLibraryFavorites();
  libraryFavorites.set(favs);
}

export async function refreshFavorites() {
  const favs = await FavoriteDB.getUltraFavorites();
  ultraFavorites.set(favs);
  const uload = get(favoritesLoaded);
  for (let id of Object.keys(uload)) {
    if (!favs.map((f) => f.id.toString()).includes(id)) {
      removeFavorite(id);
    }
  }
}

export async function refreshReadeds(favorite: Favorite) {
  const newReadeds = await ReadedDB.getReadeds(favorite);
  readeds.set(newReadeds);
}

export async function refreshTags() {
  const newTags = await MarkDB.getMarks();
  tags.set(newTags);
}

export async function refreshPanels() {
  const path = "favorite-panels";
  let downloaded: DirEntry[] = [];
  if (await exists(path, { baseDir: BaseDirectory.Document })) {
    downloaded = await readDir(path, {
      baseDir: BaseDirectory.Document,
    });
  }
  panels.set([]);
  let localPanels = [];
  const docDir = await documentDir();
  for (const panel of downloaded) {
    const path = await join(docDir, "favorite-panels", panel.name);
    localPanels.push({ src: convertFileSrc(path), path, shouldCopy: false });
  }
  panels.set(localPanels);
}
