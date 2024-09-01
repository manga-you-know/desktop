import { PrismaClient } from "@prisma/client";

export default class PrismaDB {
  private static prismaDB: PrismaClient;

  static getClient(): PrismaClient {
    if (this.prismaDB) {
      return this.prismaDB;
    } else {
      this.prismaDB = new PrismaClient();
      return this.prismaDB;
    }
  }
}