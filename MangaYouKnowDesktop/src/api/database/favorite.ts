import PrismaDB from "../prisma";
import type { Favorite } from "@prisma/client";

export const getFavorites = async (userId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.favorite.findMany({
    where: {
      userId: userId,
    },
  });
}

export const getFavorite = async (userId: number, favoriteId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.favorite.findFirst({
    where: {
      id: favoriteId,
      userId: userId,
    },
  });
}

export const createFavorite = async (favorite: Favorite) => {
  const prisma = PrismaDB.getClient();
  return await prisma.favorite.create({
    data: {
      ...favorite
    },
  });
}

export const deleteFavorite = async (userId: number, mangaId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.favorite.delete({
    where: {
      id: mangaId,
      userId: userId,
    },
  });
}