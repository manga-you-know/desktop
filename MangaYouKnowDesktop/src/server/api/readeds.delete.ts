import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const readed = await prisma.readed.delete({
    where: {
      id: body.id,
      favoriteId: body.userId,
    }
  })
  return readed
}); 