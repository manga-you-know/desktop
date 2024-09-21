import prisma from "~/lib/prisma";

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()
  return users
}); 