import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import type { Chapter, Favorite } from "@/interfaces";
import { FavoriteRepository, ReadedRepository } from "@/repositories";
import { downloadManager, preferableLanguage, ultraFavorites } from "@/store";
import { isReaded, notify, refreshFavorites } from "@/functions";
import type { Readed } from "@/models";
import { toast } from "svelte-sonner";

const window = getCurrentWindow();

export async function rerenderFavorites(): Promise<void> {
  ultraFavorites.set([]);
  await new Promise((resolve) => setTimeout(resolve, 5));
  await refreshFavorites();
}

export async function loadFavoriteChapters(
  rerenderFavoritesOption = false
): Promise<void> {
  const favorites = await FavoriteRepository.getUltraFavorites();
  await Promise.all(favorites.map(loadFavoriteChapter));
  if (rerenderFavoritesOption) {
    await rerenderFavorites();
  }
}

export async function loadFavoriteChapter(favorite: Favorite): Promise<void> {
  const dl = get(downloadManager);
  let chapters: Chapter[] = [];
  let readeds: Readed[] = [];
  let chaptersToRead: Chapter[] = [];
  let nextChapter: Chapter | null = null;
  readeds = await ReadedRepository.getReadeds(favorite);
  if (favorite.type === "anime") {
    chapters = await dl.getEpisodes(favorite);
  } else {
    const isMulti = dl.isMultiLanguage(favorite.source);
    if (isMulti) {
      const lastReaded = await ReadedRepository.getLastReaded(favorite);
      if (lastReaded) {
        chapters = await dl.getChapters(favorite, lastReaded.language);
      } else {
        chapters = await dl.getChapters(favorite, get(preferableLanguage).id);
      }
    } else {
      chapters = await dl.getChapters(favorite);
    }
  }
  chaptersToRead = [];
  for (const chapter of chapters) {
    if (isReaded(chapter, readeds)) {
      break;
    }
    chaptersToRead.push(chapter);
  }
  if (chaptersToRead.length > 0) {
    chaptersToRead.reverse();
    nextChapter = chaptersToRead[0];
    chaptersToRead.reverse();
    let valToRead = await getValueToRead(favorite);
    if (valToRead) {
      if (
        chaptersToRead.length > valToRead.chaptersToRead &&
        chapters.length !== valToRead.chapters
      ) {
        if (await window.isFocused()) {
          toast.info(
            `+${chaptersToRead.length - valToRead.chaptersToRead} chapters!`
          );
        } else {
          await notify(
            favorite.name,
            `+${chaptersToRead.length - valToRead.chaptersToRead} chapters!`
          );
        }
      }
    }
  }
  await setValueToRead(
    favorite,
    chapters.length,
    readeds.length,
    chaptersToRead.length
  );
}
export async function getValueToRead(favorite: Favorite): Promise<
  | {
      chapters: number;
      chaptersReaded: number;
      chaptersToRead: number;
    }
  | undefined
> {
  const favoriteStore = await load("favorite_store.json");
  return await favoriteStore.get<{
    chapters: number;
    chaptersReaded: number;
    chaptersToRead: number;
  }>(`${favorite.id}`);
}

export async function setValueToRead(
  favorite: Favorite,
  chapters: number,
  chaptersReaded: number,
  chaptersToRead: number
): Promise<void> {
  const favoriteStore = await load("favorite_store.json");
  await favoriteStore.set(`${favorite.id}`, {
    chapters,
    chaptersReaded,
    chaptersToRead,
  });
}
