import { ReadedRepository } from "~/database";
import type { Chapter, Favorite, Readed } from "~/models";

export function isReaded(chapter: Chapter, readeds: Readed[]) {
  return readeds.find(
    (r) =>
      r.chapter_id === chapter.chapter_id && r.language === chapter.language,
  );
}

export async function addReadedBelow(
  chapter: Chapter,
  chapters: Chapter[],
  favorite: Favorite,
  readeds?: Readed[],
  dontDelete?: boolean,
) {
  const localReadeds = readeds ?? (await ReadedRepository.getReadeds(favorite));
  const readed = isReaded(chapter, localReadeds);
  if (readed) {
    if (!dontDelete) await deleteReadedAbove(readed, chapters, localReadeds);
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
  readeds: Readed[],
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
