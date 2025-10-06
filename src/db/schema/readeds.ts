import { sqliteTable, integer, text, unique, index, } from "drizzle-orm/sqlite-core";
import { favorites } from "./favorites";


export const readeds = sqliteTable("readed", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapterId: text("chapter_id").notNull(),
  source: text("source").notNull(),
  language: text("language").default("default"),
  favoriteId: integer("favorite_id").notNull().references(() => favorites.id)
},
  (t) => [
    unique().on(t.chapterId, t.source, t.language, t.favoriteId),
    index("idx_readed_favorites").on(t.favoriteId),
    index("idx_readed_composite").on(t.chapterId, t.source, t.language, t.favoriteId)
  ]
)
