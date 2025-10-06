import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { favorites } from "./favorites";
import { marks } from "./marks";


export const markFavorites = sqliteTable("mark_favorite", {
  markId: integer("mark_id").notNull().primaryKey().references(() => marks.id),
  favoriteId: integer("favorite_id").notNull().references(() => favorites.id),
}, (t) => [
  index("idx_mark_favorites_mark_id").on(t.markId),
  index("idx_mark_favorites_favorite_id").on(t.favoriteId)
]
)
