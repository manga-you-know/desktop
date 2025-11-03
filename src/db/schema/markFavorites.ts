import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { favorites } from "./favorites";
import { marks } from "./marks";


export const markFavorites = sqliteTable("mark_favorite", {
  markID: integer().notNull().primaryKey().references(() => marks.id),
  savedID: integer().notNull().references(() => favorites.id),
}, (t) => [
  index("idx_mark_favorites_mark_id").on(t.markID),
  index("idx_mark_favorites_favorite_id").on(t.savedID)
]
)
