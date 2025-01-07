import { FavoriteRepository, ReadedRepository } from "@/repositories";
import { libraryFavorites, ultraFavorites } from "@/store";
import type { Chapter, Favorite } from "@/interfaces";
import type { Readed } from "@/models";

export function isReaded(chapter: Chapter, readeds: Readed[]) {
  return readeds.find(
    (r) =>
      r.chapter_id === chapter.chapter_id && r.language === chapter.language
  );
}

export async function isFavorite(favorite: Favorite): Promise<boolean> {
  const rawFavs = await FavoriteRepository.getRawFavorites();
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
  const localReadeds = readeds ?? (await ReadedRepository.getReadeds(favorite));
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
  await ReadedRepository.createReadeds(toAdd, favorite.id);
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
  await ReadedRepository.deleteReadeds(toDelete);
}

export async function refreshLibrary() {
  const favs = await FavoriteRepository.getFavorites();
  libraryFavorites.set(favs);
}

export async function refreshFavorites() {
  const favs = await FavoriteRepository.getUltraFavorites();
  ultraFavorites.set(favs);
}
