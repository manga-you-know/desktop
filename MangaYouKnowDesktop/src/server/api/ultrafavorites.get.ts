import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  var query  = getQuery(event);
  const favorites = await prisma.favorite.findMany({
    where: { //@ts-ignore
      userId: Number(query.userId),
      isUltraFavorite: true
    }
  })
  return favorites
}); 