import type { favorites } from "@/db";
import type { SavedType } from "./savedType";

export type SearchResult = typeof favorites.$inferInsert


// export type SearchResult = {
//   name: string;
//   link: string;
//   cover: string;
//   source: string;
//   sourceID: string;
//   folderName: string;
//   type: SavedType;
//   description?: string;
//   extraName?: string;
//   author?: string;
//   malID?: string;
//   anilistID?: string;
// }
