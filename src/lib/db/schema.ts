import {
  sqliteTable,
  integer,
  text,
  real,
  unique,
  index,
} from "drizzle-orm/sqlite-core";

export const mangas = sqliteTable(
  "mangas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slugName: text("slug_name"),
    currentCover: text("current_cover").notNull(),
    covers: text("covers").$type<string[]>().default([]),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    type: text("type").default("manga"),
    notes: text("notes"),
    commentary: text("commentary"),
    rating: real("rating"),
    author: text("author").default("-"),
    artist: text("artist").default("-"),
    readingStatus: text("status").default("-"),
    anilistId: text("anilist_id").default(""),
    malId: text("mal_id").default(""),
    description: text("description").default(""),
    configs: text("configs", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
    otherNames: text("other_names", { mode: "json" })
      .$type<string[]>()
      .default([]),
    genre: text("genre", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
  },
  // (t) => [
  //   unique().on(t.sourceId, t.source, t.type, t.userId),
  //   index("idx_favorite_user_id").on(t.userId),
  // ],
);

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mangaId: integer("manga_id").references(() => mangas.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(), // local source: "Local"
  mangaSourceId: text("manga_source_id").notNull(), // local source: final path
  sourceId: text("source_id").notNull(), // local source: root path
  extensionId: text("extension_id").notNull(), // local source: "local=" + type of media (cbz, pdf, folder with images)
  sourceCover: text("source_cover"),
  realUrl: text("real_url").notNull(), // local source: path to open (root + final)
  coverUrl: text("cover_url").notNull(),
  coverUrlLastFetched: integer("cover_url_last_fetched", {
    mode: "timestamp",
  }).$defaultFn(() => new Date()),
  lastFetched: integer("last_fetched", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  status: text("status"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
});

export const chapters = sqliteTable(
  "chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id").notNull(), // local source:  final path in source path
    chapterNumber: text("chapter_number"),
    chapterTitle: text("chapter_title"),
    language: text("language").default("-"),
    isRead: integer("is_read", { mode: "boolean" }).default(false),
    readAt: integer("read_at", { mode: "timestamp" }),
    commentary: text("commentary"),
    rating: real("rating"),
    updatedAt: integer("update_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.chapterId, t.sourceId, t.language, t.mangaId)],
);

export const series = sqliteTable("series", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  coverUrl: text("cover_url"),
  layout: text("layout"),
  description: text("description"),
  commentary: text("commentary"),
  rating: real("rating"),
});

export const seriesMangas = sqliteTable("series_mangas", {
  serieId: integer("series_id")
    .primaryKey()
    .notNull()
    .references(() => series.id, { onDelete: "cascade" }),
  mangaId: integer("manga_id")
    .primaryKey()
    .notNull()
    .references(() => mangas.id, { onDelete: "cascade" }),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
});

export const categoryMangas = sqliteTable("category_mangas", {
  categoryId: integer("category_id")
    .primaryKey()
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  mangaId: integer("manga_id")
    .notNull()
    .references(() => mangas.id, { onDelete: "cascade" }),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  filters: text("filters", { mode: "json" })
    .$type<Record<string, Record<string, any>>>()
    .default({}),
  ordersBy: text("orders", { mode: "json" })
    .$type<Record<string, string>>()
    .default({}),
});

export const savedImages = sqliteTable("saved_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  manga_id: integer("manga_id").references(() => mangas.id, {
    onDelete: "set null",
  }),
  path: text("path").notNull(),
  title: text("title"),
  note: text("note"),
  mangaTitle: text("manga_title"),
  chapterTitle: text("chapter_title"),
  chapterNumber: text("chapter_number"),
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  note: text("note"),
  loggedAt: integer("logged_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
