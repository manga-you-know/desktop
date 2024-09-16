import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const favorite = await prisma.favorite.delete({
    where: {
      id: body.id,
      userId: body.userId,
    }
  })
  return favorite
}); 