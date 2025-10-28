import { sqliteTable, integer, text, real, unique, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";


export const favorites = sqliteTable("favorite", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userID: integer("user_id").default(1).references(() => users.id),
  name: text("name").notNull(),
  folderName: text("folder_name").notNull(),
  link: text("link").notNull(),
  cover: text("cover").notNull(),
  source: text("source").notNull(),
  sourceID: text("source_id").notNull(),
  type: text("type").default("manga"),
  status: text("status").default("on hold"),
  extraName: text("extra_name").default(""),
  titleColor: text("title_color").default(""),
  cardColor: text("card_color").default(""),
  grade: real("grade").default(0.0),
  anilistID: text("anilist_id").default(""),
  malID: text("mal_id").default(""),
  author: text("author").default("Unknow"),
  isUltraFavorite: integer("is_ultra_favorite", { mode: "boolean" }).default(false),
  description: text("description").default(""),
},
  (t) => [
    unique().on(t.sourceID, t.source, t.type, t.userID),
    index("idx_favorite_user_id").on(t.userID),
  ]
)

