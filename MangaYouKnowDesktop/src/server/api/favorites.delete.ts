import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const favorite = await prisma.favorite.delete({
    where: {
      id: body.id,
      userId: body.userId,
    }
  })
  prisma.readed.deleteMany({
    where: {
      favoriteId: body.id
    }
  })
  return favorite
}); 