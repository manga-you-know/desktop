import { getCurrentWindow } from "@tauri-apps/api/window";
import { load, Store } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import type { Chapter, Favorite, FavoriteLoaded, Readed } from "@/types";
import { FavoriteDB, ReadedDB } from "@/repositories";
import {
  downloadManager,
  favoritesLoaded,
  isRefreshing,
  preferableLanguage,
  ultraFavorites,
} from "@/store";
import { isReaded, notify, refreshFavorites } from "@/functions";
import { toast } from "svelte-sonner";
import { strNotEmpty } from "@/utils";
import type { DownloadManager } from "@/managers";

const window = getCurrentWindow();

let dl: DownloadManager;
let favoriteStore: Store = null!;
downloadManager.subscribe((value) => {
  dl = value;
});

async function loadFavoriteStore() {
  if (!favoriteStore)
    favoriteStore = await load("favorite_store.json");
}

function addFavorite(favorite: Favorite) {
  favoritesLoaded.update((currentFavorites) => {
    return {
      ...currentFavorites,
      [favorite.id?.toString() ?? ""]: {
        isLoaded: false,
        isLoading: false,
        chapters: [],
        readeds: [],
        toReadCount: 0,
        startLoading: () => loadFavoriteChapters(favorite),
        nextChapter: null,
        nextImages: [],
      },
    };
  });
}

export function removeFavorite(favoriteId: string) {
  favoritesLoaded.update((currentFavorites) => {
    const { [favoriteId]: removed, ...remainingFavorites } = currentFavorites;
    return remainingFavorites;
  });
  refreshFavorites();
}

function updateFavoriteProperty(
  favoriteId: string,
  property: keyof FavoriteLoaded,
  value: any
) {
  favoritesLoaded.update((currentFavorites) => {
    return {
      ...currentFavorites,
      [favoriteId]: {
        ...currentFavorites[favoriteId],
        [property]: value,
      },
    };
  });
}

export async function rerenderFavorites(): Promise<void> {
  ultraFavorites.set([]);
  await new Promise((resolve) => setTimeout(resolve, 5));
  await refreshFavorites();
}

export async function preloadChapter(chapter: Chapter): Promise<string[]> {
  var images = await dl.getChapterImages(chapter);
  return await dl.getBase64Images(images, dl.getBaseUrl(chapter.source));
}

export async function preloadNextChapter(
  currentlyChapterIndex: number,
  chapters: Chapter[]
): Promise<string[]> {
  if (currentlyChapterIndex === 0) return [];
  return await preloadChapter(chapters[currentlyChapterIndex - 1]);
}

export async function loadFavoritesChapters(
  rerenderFavoritesOption = false
): Promise<void> {
  isRefreshing.set(true);
  const favorites = await FavoriteDB.getUltraFavorites();
  dl.clearChaptersCache();
  await Promise.all(favorites.map(loadFavoriteChapters));
  if (rerenderFavoritesOption) {
    await rerenderFavorites();
  }
  isRefreshing.set(false);
}

export async function loadFavoriteChapters(favorite: Favorite): Promise<void> {
  const loadedFavorite = get(favoritesLoaded)[strNotEmpty(favorite.id)];
  if (!loadedFavorite) {
    addFavorite(favorite);
  }
  if (loadedFavorite?.isLoading) {
    return;
  }
  updateFavoriteProperty(strNotEmpty(favorite.id), "isLoading", true);
  let chapters: Chapter[] = [];
  let readeds: Readed[] = [];
  let chaptersToRead: Chapter[] = [];
  let nextChapter: Chapter | null = null;
  readeds = await ReadedDB.getReadeds(favorite);
  if (favorite.type === "anime") {
    chapters = await dl.getEpisodes(favorite);
  } else {
    const isMulti = dl.isMultiLanguage(favorite.source);
    if (isMulti) {
      const lastReaded = await ReadedDB.getLastReaded(favorite);
      if (lastReaded) {
        chapters = await dl.getChapters(favorite, lastReaded.language);
      } else {
        chapters = await dl.getChapters(favorite, get(preferableLanguage).id);
      }
      if (chapters.length === 0) {
        const languages = await dl.getFavoriteLanguages(favorite);
        chapters = await dl.getChapters(favorite, languages[0].id);
      }
    } else {
      chapters = await dl.getChapters(favorite);
    }
  }
  chaptersToRead = [];
  if (favorite.type === "anime") {
    chapters = chapters.map((c) => {
      c.chapter_id = c.chapter_id.split("<token>")[0];
      return c;
    });
  }
  for (const chapter of chapters) {
    if (isReaded(chapter, readeds)) {
      break;
    }
    chaptersToRead.push(chapter);
  }

  favoritesLoaded.update((currentFavorites) => {
    const favoriteId = strNotEmpty(favorite.id);
    const currentFavorite = currentFavorites[favoriteId] || {
      isLoaded: false,
      isLoading: false,
      chapters: [],
      readeds: [],
      toReadCount: 0,
      startLoading: () => loadFavoriteChapters(favorite),
      nextChapter: null,
    };
    
    if (chaptersToRead.length > 0) {
      chaptersToRead.reverse();
      nextChapter = chaptersToRead[0];
      chaptersToRead.reverse();
    } else {
      nextChapter = null;
    }

    return {
      ...currentFavorites,
      [favoriteId]: {
        ...currentFavorite,
        isLoaded: true,
        isLoading: false,
        chapters,
        readeds,
        toReadCount: chaptersToRead.length,
        nextChapter,
      },
    };
  });

  let valToRead = await getValueToRead(favorite);
  if (chaptersToRead.length > 0) {
    const chaptersType = favorite.type === "anime" ? "episode" : "chapter";
    if (valToRead) {
      if (
        chaptersToRead.length > valToRead.chaptersToRead &&
        chapters.length !== valToRead.chapters
      ) {
        const newToRead =
          chaptersToRead.length - Number(valToRead.chaptersToRead);
        await notify(
          favorite.name,
          newToRead === 1
            ? `New ${chaptersType} available!`
            : `+${newToRead} ${chaptersType}s!`
        );
      }
    }
  }

  if (chapters.length > 0) {
    await setValueToRead(
      favorite,
      chapters.length,
      readeds.length,
      chaptersToRead.length
    );
  }

  const fetchNext = async () => {
    if (nextChapter !== null) {
      const nextImages = await preloadChapter(nextChapter);
      favoritesLoaded.update((currentFavorites) => {
        const favoriteId = strNotEmpty(favorite.id);
        return {
          ...currentFavorites,
          [favoriteId]: {
            ...currentFavorites[favoriteId],
            nextImages,
          },
        };
      });
    }
  };
  fetchNext();
}

export async function getValueToRead(favorite: Favorite): Promise<
  | {
      chapters: number;
      chaptersReaded: number;
      chaptersToRead: number;
    }
  | undefined
> {
  await loadFavoriteStore();
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
  await loadFavoriteStore();
  await favoriteStore.set(`${favorite.id}`, {
    chapters,
    chaptersReaded,
    chaptersToRead,
  });
}
