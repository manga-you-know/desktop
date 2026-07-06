import { favorites } from "@/lib/db/schemas";

export type Favorite = typeof favorites.$inferSelect;
