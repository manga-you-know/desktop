import { getCurrentWindow } from "@tauri-apps/api/window";
import { load, Store } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import { type ReadCache, type Chapter, type Favorite, type FavoriteLoaded, type Readed } from "@/types";
import { FavoriteDB, ReadedDB } from "@/repositories";
import {
  chaptersCache,
  customNotificator,
  downloadManager,
  favoritesLoaded,
  globalChapters,
  isRefreshing,
  notifyFavorites,
  openAdd,
  openDownloads,
  openInfo,
  openSearch,
  openSettings,
  openTag,
  preferableLanguage,
  showCountIcon,
  ultraFavorites,
} from "@/store";
import { isReaded, notify, refreshFavorites, removeCountIcon, setCountIcon, setCountTray } from "@/functions";
import { toast } from "svelte-sonner";
import { strNotEmpty } from "@/utils";
import type { DownloadManager } from "@/managers";
import { listen } from "@tauri-apps/api/event";
import { goto } from "$app/navigation";

const window = getCurrentWindow();

let dl: DownloadManager;
let favoriteStore: Store = null!;
let cacheStore: Store = null!;
downloadManager.subscribe((value) => {
  dl = value;
});

async function loadFavoriteStore() {
  if (!favoriteStore)
    favoriteStore = await load("favorite_store.json");
}

async function loadCacheStore() {
  if (!cacheStore)
    cacheStore = await load("cache_store.json")
}

async function preloadCache(cache: ReadCache) {
  const oldCache = getCache(cache.favorite.id.toString());
  if (oldCache === undefined) return
  const images = await dl.getChapterImages(cache.chapter)
  const imagesB64 = await dl.getBase64Images(images, dl.getBaseUrl(cache.favorite.source))
  if (oldCache.chapters?.length === 0) {
    oldCache.chapters = await dl.getChapters(cache.favorite)
  }
  oldCache.images = imagesB64
  const oldList = get(chaptersCache)
  let final: (ReadCache & { chapters: Chapter[]; images: string[] })[] = []
  for (let data of oldList) {
    if (data.favorite.id === cache.favorite.id) {
      final.push(oldCache)
    } else {
      final.push(data)
    }
  }
  chaptersCache.set(final)
}

export async function refreshCache() {
  await loadCacheStore();
  const newCache = Array.from<ReadCache>(
    await cacheStore.values())
  let final: (ReadCache & { chapters: Chapter[]; images: string[] })[] = []
  for (let cache of newCache) {
    const loaded = getCache(cache.favorite.id.toString())
    if (loaded?.chapter?.chapter_id === cache.chapter.chapter_id && loaded?.images?.length > 0 && loaded?.chapters?.length > 0) {
      final.push({
        ...cache,
        images: loaded.images,
        chapters: loaded.chapters
      })
    } else {
      final.push({
        ...cache,
        images: [],
        chapters: []
      })
      preloadCache(cache)
    }
  }
  chaptersCache.set(final)
}

export function getCache(favoriteId: string): (ReadCache & { chapters: Chapter[]; images: string[] }) | undefined {
  return get(chaptersCache).find(cache => cache.favorite.id.toString() === favoriteId)
}

export async function addToCache(cache: ReadCache, chapters: Chapter[], images: string[] = []) {
  await loadCacheStore();
  await cacheStore.set(cache.favorite.id.toString(), cache);
  const oldList = get(chaptersCache)
  let final: (ReadCache & { chapters: Chapter[]; images: string[] })[] = []
  for (let data of oldList) {
    if (data.favorite.id === cache.favorite.id) {
      final.push({ ...cache, chapters, images })
    } else {
      final.push(data)
    }
  }
  chaptersCache.set(final)
  await refreshCache();
}

export async function removeCache(favoriteId: string) {
  await loadCacheStore();
  await cacheStore.delete(favoriteId)
  await refreshCache();
}

export async function clearCache() {
  await loadCacheStore();
  await cacheStore.clear();
  chaptersCache.set([])
}


function addFavorite(favorite: Favorite) {
  favoritesLoaded.update((currentFavorites) => {
    return {
      ...currentFavorites,
      [favorite.id.toString() ?? ""]: {
        self: favorite,
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

export async function updateBadge() {
  const toRead = Object.values(get(favoritesLoaded)).filter(fv => fv.nextChapter !== null).length;
  if (toRead > 0 && get(showCountIcon)) {
    await setCountIcon(toRead);
  } else {
    await removeCountIcon();
  }
  await setCountTray(toRead);
}

export async function loadFavoritesChapters(
  rerenderFavoritesOption = false
): Promise<void> {
  isRefreshing.set(true);
  const favorites = await FavoriteDB.getUltraFavorites();
  dl.clearChaptersCache();
  await Promise.all(favorites.map(loadFavoriteChapters));
  // if (rerenderFavoritesOption) {
  //await rerenderFavorites();
  //}
  isRefreshing.set(false);
  await updateBadge()
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
  updateFavoriteProperty(strNotEmpty(favorite.id), "readeds", readeds);
  try {
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
  } catch (e) {
    updateFavoriteProperty(strNotEmpty(favorite.id), "isLoading", false);
    console.log(e)
    return
  }
  if (chapters.length === 0) {
    updateFavoriteProperty(strNotEmpty(favorite.id), "isLoading", false);
    return
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
      self: favorite,
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
        self: favorite,
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
        if (get(notifyFavorites)) {
          await notify(
            favorite.name,
            newToRead === 1
              ? `New ${chaptersType} available!`
              : `+${newToRead} ${chaptersType}s!`,
            `read-${favorite.id}`,
            true
          );
          if (get(customNotificator)) {
            listen(`read-${favorite.id}`, async () => {
              openSearch.set(false)
              openSettings.set(false)
              openTag.set(false)
              openInfo.set(false)
              openAdd.set(false)
              openDownloads.set(false)
              globalChapters.set(chapters)
              goto(
                `/reader/${favorite.id}/${chapters.indexOf(
                  nextChapter ?? chapters[0]
                )}`,
              );
            })
          }
        }
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
  updateBadge();
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
