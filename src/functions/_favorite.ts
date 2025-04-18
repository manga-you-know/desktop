import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import type { Chapter, Favorite, FavoriteLoaded, Readed } from "@/interfaces";
import { FavoriteRepository, ReadedRepository } from "@/repositories";
import {
  downloadManager,
  favoritesLoaded,
  preferableLanguage,
  ultraFavorites,
} from "@/store";
import { isReaded, notify, refreshFavorites } from "@/functions";
import { toast } from "svelte-sonner";
import { strNotEmpty } from "@/utils";
import type { DownloadManager } from "@/managers";

const window = getCurrentWindow();

let dl: DownloadManager;
downloadManager.subscribe((value) => {
  dl = value;
});

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
        startLoading: () => loadFavoriteChapter(favorite),
        nextChapter: null,
      },
    };
  });
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

export async function preloadChapter(chapter: Chapter): Promise<void> {
  var images = await dl.getChapterImages(chapter);
  images = await dl.getBase64Images(images, dl.getBaseUrl(chapter.source));
}

export async function preloadNextChapter(
  currentlyChapterIndex: number,
  chapters: Chapter[]
): Promise<void> {
  if (currentlyChapterIndex === 0) return;
  preloadChapter(chapters[currentlyChapterIndex - 1]);
}

export async function loadFavoriteChapters(
  rerenderFavoritesOption = false
): Promise<void> {
  const favorites = await FavoriteRepository.getUltraFavorites();
  dl.clearChaptersCache();
  await Promise.all(favorites.map(loadFavoriteChapter));
  if (rerenderFavoritesOption) {
    await rerenderFavorites();
  }
}

export async function loadFavoriteChapter(favorite: Favorite): Promise<void> {
  const loadedFavorite = get(favoritesLoaded)[strNotEmpty(favorite.id)];
  if (!loadedFavorite) {
    addFavorite(favorite);
  }
  if (loadedFavorite.isLoading) {
    return;
  }
  updateFavoriteProperty(strNotEmpty(favorite.id), "isLoading", true);
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
      if (chapters.length === 0) {
        const languages = await dl.getFavoriteLanguages(favorite);
        chapters = await dl.getChapters(favorite, languages[0].id);
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
  updateFavoriteProperty(
    strNotEmpty(favorite.id),
    "toReadCount",
    chaptersToRead.length
  );
  // if (favorite.type !== "anime" && nextChapter) {
  //   preloadChapter(nextChapter);
  // }
  updateFavoriteProperty(strNotEmpty(favorite.id), "chapters", chapters);
  updateFavoriteProperty(strNotEmpty(favorite.id), "readeds", readeds);
  updateFavoriteProperty(strNotEmpty(favorite.id), "isLoaded", true);
  updateFavoriteProperty(strNotEmpty(favorite.id), "isLoading", false);
  if (chaptersToRead.length > 0) {
    chaptersToRead.reverse();
    nextChapter = chaptersToRead[0];
    updateFavoriteProperty(
      strNotEmpty(favorite.id),
      "nextChapter",
      nextChapter
    );
    chaptersToRead.reverse();
    const chaptersType = favorite.type === "anime" ? "episode" : "chapter";
    let valToRead = await getValueToRead(favorite);
    if (valToRead) {
      if (
        chaptersToRead.length > valToRead.chaptersToRead &&
        chapters.length !== valToRead.chapters
      ) {
        // if (await window.isFocused()) {
        //   toast.info(
        //     `+${
        //       chaptersToRead.length - valToRead.chaptersToRead
        //     } ${chaptersType}${pluralText}!`
        //   );
        // } else {
        const newToRead =
          chaptersToRead.length - Number(valToRead.chaptersToRead);
        await notify(
          favorite.name,
          newToRead === 1
            ? `New ${chaptersType} available!`
            : `+${newToRead} ${chaptersType}s!`
        );
        // }
      }
    }
  } else {
    updateFavoriteProperty(strNotEmpty(favorite.id), "nextChapter", null);
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
