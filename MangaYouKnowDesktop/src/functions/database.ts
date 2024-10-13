import { ReadedDB } from "~/database";
import type { Chapter, Favorite, Readed } from "~/models";


export function isReaded(chapter: Chapter, readeds: Readed[]) {
	return readeds.find(r => r.chapter_id === chapter.chapter_id && r.language === chapter.language)
}

export async function addReadedBelow(chapter: Chapter, chapters: Chapter[], favorite: Favorite, readeds?: Readed[], dontDelete?: boolean) {
	if (!readeds) {
		readeds = await ReadedDB.getReadeds(favorite)
	}
	const readed = isReaded(chapter, readeds)
	if (readed) {
		if (!dontDelete) {
			await deleteReadedAbove(readed, chapters, readeds)
		}
		return
	}
	var toAdd = []
	var isForAdd = false
	for (var chapterI of chapters) {
		if (chapterI.chapter_id == chapter.chapter_id) {
			isForAdd = true
		}
		if (isForAdd ) {
			const read = isReaded(chapterI, readeds) 
			if (!read) {
				toAdd.push(chapterI)
			}
		}
	}
	await ReadedDB.createReadeds(toAdd, favorite.id)
}

export async function deleteReadedAbove(readed: Readed, chapters: Chapter[], readeds: Readed[]) {
	var toDelete: Readed[] = []
	var isForDelete = false
	for (var chapter of [...chapters].reverse()) {
		if (chapter.chapter_id == readed.chapter_id) {
			isForDelete = true
		}
		if (isForDelete ) {
			const read = isReaded(chapter, readeds) 
			if (read) {
				toDelete.push(read)
			}
		}
	}
	await ReadedDB.deleteReadeds(toDelete)
}