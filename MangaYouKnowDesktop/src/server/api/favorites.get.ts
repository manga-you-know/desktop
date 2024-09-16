import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
  const users = await prisma.favorite.findMany()
  return users
}); 