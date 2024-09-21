import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const readed = await prisma.readed.create({
    data: {
      favoriteId: body.favoriteId,
      chapterId: body.chapterId,
      source: body.source,
      language: body.language,
    }
  })
  return readed
}); 