import { sqliteTable, integer, text, unique, index, } from "drizzle-orm/sqlite-core";
import { favorites } from "./favorites";


export const readeds = sqliteTable("readed", {
  id: integer().primaryKey({ autoIncrement: true }),
  chapterId: text().notNull(),
  source: text().notNull(),
  language: text().default("default"),
  favoriteId: integer().notNull().references(() => favorites.id)
},
  (t) => [
    unique().on(t.chapterId, t.source, t.language, t.favoriteId),
    index("idx_readed_favorites").on(t.favoriteId),
    index("idx_readed_composite").on(t.chapterId, t.source, t.language, t.favoriteId)
  ]
)
