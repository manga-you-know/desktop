import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()
  return {
    statusCode: 200,
    body: JSON.stringify({
      users
    })
  };
}); 