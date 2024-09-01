import PrismaDB from "../prisma";
import type { Readed } from "@prisma/client";

export const getReadeds = async (favoriteId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.readed.findMany({
    where: {
      favoriteId: favoriteId,
    },
  });
}

export const createReaded = async (readed: Readed) => {
  const prisma = PrismaDB.getClient();
  return await prisma.readed.create({
    data: {
      ...readed
    },
  });
}

// export const deleteReaded = async (favoriteId: number, chapterId: string) => {
//   const prisma = PrismaDB.getClient();
//   return await prisma.readed.delete({
//     where: {
//       favoriteId: favoriteId,
//       chapterId: chapterId,
//     },
//   });
// }
