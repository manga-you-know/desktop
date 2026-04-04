import { favorites } from "@/lib/db";

export type Favorite = typeof favorites.$inferSelect;
