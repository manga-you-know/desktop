import PrismaDB from "../prisma";

export const getUsers = async () => {
    const prisma = PrismaDB.getClient();
    return await prisma.user.findMany();
}

export const getUser = async (userId: number) => {
    const prisma = PrismaDB.getClient();
    return await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
}

export const createUser = async (username: string, password: string) => {
    const prisma = PrismaDB.getClient();
    return await prisma.user.create({
        data: {
            username: username,
            password: password,
        },
    });
}

export const deleteUser = async (userId: number) => {
    const prisma = PrismaDB.getClient();
    return await prisma.user.delete({
        where: {
            id: userId,
        },
    });
}