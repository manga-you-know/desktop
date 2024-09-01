import PrismaDB from "../prisma";

export const getMarks = async (userId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.mark.findMany({
    where: {
      userId: userId,
    },
  });
}

export const createMark = async (userId: number, name: string) => {
  const prisma = PrismaDB.getClient();
  return await prisma.mark.create({
    data: {
      userId: userId,
      name: name 
    },
  });
}

export const deleteMark = async (userId: number, markId: number) => {
  const prisma = PrismaDB.getClient();
  return await prisma.mark.delete({
    where: {
      id: markId,
      userId: userId,
    },
  });
}