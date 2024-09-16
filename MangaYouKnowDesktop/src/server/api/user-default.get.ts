import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()
  if (users.length === 0) {
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        icon: 'https://cdn.discordapp.com/embed/avatars/0.png',
      }
    })
    return user
  }
  const user = users[0]
  return user
}); 