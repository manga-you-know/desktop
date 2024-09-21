import prisma from "~/lib/prisma";
import type { Readed } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const readeds = await prisma.readed.deleteMany({
		where: {
			id: {
				in: body.map((readed: Readed) => {
					return readed.id
				})
			}
		}
	})
  return readeds
}); 