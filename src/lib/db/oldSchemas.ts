import {
  sqliteTable,
  integer,
  text,
  real,
  unique,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique(),
  username: text("username").notNull(),
  icon: text("icon").default("https://cdn.discordapp.com/embed/avatars/0.png"),
  password: text("password").default(""),
  isAuthenticated: integer("is_authenticated", { mode: "boolean" }).default(
    false,
  ),
});

export const favorites = sqliteTable(
  "favorite",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .default(1)
      .references(() => users.id),
    name: text("name").notNull(),
    folderName: text("folder_name").notNull(),
    link: text("link").notNull(),
    cover: text("cover").notNull(),
    source: text("source").notNull(),
    sourceId: text("source_id").notNull(),
    type: text("type").default("manga"),
    status: text("status").default("on hold"),
    extraName: text("extra_name").default(""),
    titleColor: text("title_color").default(""),
    cardColor: text("card_color").default(""),
    grade: real("grade").default(0.0),
    anilistId: text("anilist_id").default(""),
    malId: text("mal_id").default(""),
    author: text("author").default("Unknow"),
    isUltraFavorite: integer("is_ultra_favorite", { mode: "boolean" }).default(
      false,
    ),
    description: text("description").default(""),
  },
  (t) => [
    unique().on(t.sourceId, t.source, t.type, t.userId),
    index("idx_favorite_user_id").on(t.userId),
  ],
);

export const readeds = sqliteTable(
  "readed",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    chapterId: text("chapter_id").notNull(),
    source: text("source").notNull(),
    language: text("language").default("default"),
    favoriteId: integer("favorite_id")
      .notNull()
      .references(() => favorites.id),
  },
  (t) => [
    unique().on(t.chapterId, t.source, t.language, t.favoriteId),
    index("idx_readed_favorites").on(t.favoriteId),
    index("idx_readed_composite").on(
      t.chapterId,
      t.source,
      t.language,
      t.favoriteId,
    ),
  ],
);

export const marks = sqliteTable("mark", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  color: text("color").default(""),
});


export const markFavorites = sqliteTable(
  "mark_favorite",
  {
    markID: integer("mark_id")
      .notNull()
      .primaryKey()
      .references(() => marks.id),
    savedID: integer("saved_id")
      .notNull()
      .references(() => favorites.id),
  },
  (t) => [
    index("idx_mark_favorites_mark_id").on(t.markID),
    index("idx_mark_favorites_favorite_id").on(t.savedID),
  ],
);
