import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const favorite = await prisma.favorite.create({
    data: {
      userId: body.userId,
      name: body.name,
      folderName: body.folderName,
      cover: body.cover,
      source: body.source,
      sourceId: body.sourceId,
      type: body.type,
      extraName: body.extraName,
      titleColor: body.titleColor,
      cardColor: body.cardColor,
      grade: body.grade,
      author: body.author,
      description: body.description,
    }
  })
  return favorite
}); 