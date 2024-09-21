import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const favorite = await prisma.favorite.update({
    where: {
      id: body.id,
    },
    data: {
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
      isUltraFavorite: body.isUltraFavorite,
    }
  })
  return favorite
}); 