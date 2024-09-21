import prisma from "~/lib/prisma";
import { Chapter } from "~/models/chapter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const readeds = await prisma.readed.createMany({
    data: body.chapters.map((chapter: Chapter) => {
      return {
        favoriteId: body.favoriteId,
        chapterId: chapter.chapterId,
        source: chapter.source,
        language: chapter.language,
      }
    })
  })
  return readeds
}); 