import { marks } from "@/lib/db/schemas";

export type Mark = typeof marks.$inferSelect;
