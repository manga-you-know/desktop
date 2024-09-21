import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query  = getQuery(event);
  const readeds = await prisma.readed.findMany({
    where: { //@ts-ignore
      favoriteId: Number(query.favoriteId),
    }
  })
  return readeds
}); 