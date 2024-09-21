import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.username) {
    const user = await prisma.user.create({
      data: {
        email: body?.email,
        username: body.username,
        password: body?.password

      }
    })
    return {
      statusCode: 200,
      body: JSON.stringify({
        user
      })
    };
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Not provided a username.'
    })
  };
}); 