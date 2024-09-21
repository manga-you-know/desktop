import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (query.query === undefined) {
    const favorites = await prisma.favorite.findMany({
      where: { //@ts-ignore
        userId: Number(query.userId),
      }
    })
    return favorites
  } else {
    const favorites = await prisma.favorite.findMany({
      where: { //@ts-ignore
        userId: Number(query.userId),
        name: { //@ts-ignore
          contains: query.query,
        },
      }
    })
    return favorites
  }
}); 