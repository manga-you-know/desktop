import {
  sqliteTable,
  integer,
  text,
  real,
  unique,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

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
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
    type: text("type").default("manga"),
    notes: text("notes"),
    commentary: text("commentary"),
    rating: real("rating"),
    author: text("author"),
    artist: text("artist"),
    readingStatus: text("status"),
    anilistId: text("anilist_id"),
    malId: text("mal_id"),
    description: text("description"),
    updatedAt: integer("update_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    otherNames: text("other_names", { mode: "json" })
      .$type<string[]>()
      .default([]),
    genre: text("genre", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    config: text("config", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_mangas_slug_name").on(t.slugName),
    index("idx_mangas_is_favorite").on(t.isFavorite),
    index("idx_mangas_is_hidden").on(t.isHidden),
    index("idx_mangas_is_anonymous").on(t.isAnonymous),
    index("idx_mangas_created_at").on(t.createdAt),
    index("idx_mangas_updated_at").on(t.updatedAt),
    index("idx_mangas_status").on(t.readingStatus),
    index("idx_mangas_rating").on(t.rating),
    index("idx_mangas_anilist_id").on(t.anilistId),
    index("idx_mangas_mal_id").on(t.malId),
  ],
);

export const sources = sqliteTable(
  "sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mangaId: integer("manga_id").references(() => mangas.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(), // local source: "Local"
    mangaSourceId: text("manga_source_id").notNull(), // local source: final path
    sourceId: text("source_id").notNull(), // local source: root path
    extensionId: text("extension_id").notNull(), // local source: "local=" + type of media (cbz, pdf, folder images)
    iconUrl: text("iconUrl"),
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
  },
  (t) => [
    index("idx_sources_manga_id").on(t.mangaId),
    index("idx_sources_enabled").on(t.enabled),
  ],
);

export const chapters = sqliteTable(
  "chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id").notNull(), // local source:  final path in source path
    sortIndex: integer("sort_index").notNull(),
    chapterNumber: text("chapter_number"),
    chapterTitle: text("chapter_title"),
    language: text("language").default("-"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isRead: integer("is_read", { mode: "boolean" }).default(false),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    readAt: integer("read_at", { mode: "timestamp" }),
    commentary: text("commentary"),
    rating: real("rating"),
    updatedAt: integer("update_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    config: text("config", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    unique().on(t.chapterId, t.sourceId, t.language, t.mangaId),
    index("idx_chapters_manga_id").on(t.mangaId),
    index("idx_chapters_source_id").on(t.sourceId),
    index("idx_chapters_sort_index").on(t.sortIndex),
    index("idx_chapters_is_read").on(t.isRead),
    index("idx_chapters_is_favorite").on(t.isFavorite),
    index("idx_chapters_is_anonymous").on(t.isAnonymous),
    index("idx_chapters_is_hidden").on(t.isHidden),
    index("idx_chapters_read_at").on(t.readAt),
  ],
);

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    coverUrl: text("cover_url"),
    description: text("description"),
    commentary: text("commentary"),
    author: text("author"),
    artist: text("artist"),
    rating: real("rating"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    config: text("config", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_series_is_favorite").on(t.isFavorite),
    index("idx_series_is_hidden").on(t.isHidden),
  ],
);

export const seriesMangas = sqliteTable(
  "series_mangas",
  {
    serieId: integer("serie_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    sortIndex: integer("sort_index").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.serieId, t.mangaId] }),
    index("idx_series_mangas_manga_id").on(t.mangaId),
    index("idx_series_sort_index").on(t.sortIndex),
  ],
);

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  sortIndex: integer("sort_index"),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  config: text("config", { mode: "json" })
    .$type<Record<string, any>>()
    .default({}),
});

export const categoryMangas = sqliteTable(
  "category_mangas",
  {
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id").references(() => mangas.id, {
      onDelete: "cascade",
    }),
    serieId: integer("serie_id").references(() => series.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [
    unique().on(t.categoryId, t.mangaId),
    unique().on(t.categoryId, t.serieId),
    index("idx_category_mangas_manga_id").on(t.mangaId),
    index("idx_category_mangas_serie_id").on(t.serieId),
  ],
);

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  sortIndex: integer("sort_index"),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  filters: text("filters", { mode: "json" })
    .$type<Record<string, Record<string, any>>[]>()
    .default([]),
  ordersBy: text("orders", { mode: "json" })
    .$type<Record<string, string>[]>()
    .default([]),
  config: text("config", { mode: "json" })
    .$type<Record<string, any>>()
    .default({}),
});

export const savedImages = sqliteTable(
  "saved_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mangaId: integer("manga_id").references(() => mangas.id, {
      onDelete: "set null",
    }),
    path: text("path").notNull(),
    title: text("title"),
    note: text("note"),
    mangaTitle: text("manga_title"),
    chapterTitle: text("chapter_title"),
    chapterNumber: text("chapter_number"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    config: text("config", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_saved_images_manga_id").on(t.mangaId),
    index("idx_saved_images_is_favorite").on(t.isFavorite),
    index("idx_saved_images_is_hidden").on(t.isHidden),
  ],
);

export const logs = sqliteTable(
  "logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind").notNull(),
    eventId: text("event_id")
      .notNull()
      .$defaultFn(() => Date.now().toString()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    note: text("note"),
    shouldNotify: integer("should_notify", { mode: "boolean" }).default(false),
    notifiedAt: integer("notified_at", { mode: "timestamp" }),
    loggedAt: integer("logged_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    config: text("config", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    unique().on(t.kind, t.eventId),
    index("idx_logs_kind").on(t.kind),
    index("idx_logs_logged_at").on(t.loggedAt),
    index("idx_logs_should_notify").on(t.shouldNotify),
  ],
);

export const mangasRelations = relations(mangas, ({ many }) => ({
  sources: many(sources),
  chapters: many(chapters),
  seriesLinks: many(seriesMangas),
  categoryLinks: many(categoryMangas),
  savedImages: many(savedImages),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  manga: one(mangas, {
    fields: [sources.mangaId],
    references: [mangas.id],
  }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  manga: one(mangas, {
    fields: [chapters.mangaId],
    references: [mangas.id],
  }),
  source: one(sources, {
    fields: [chapters.sourceId],
    references: [sources.id],
  }),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  mangaLinks: many(seriesMangas),
}));

export const seriesMangasRelations = relations(seriesMangas, ({ one }) => ({
  series: one(series, {
    fields: [seriesMangas.serieId],
    references: [series.id],
  }),
  manga: one(mangas, {
    fields: [seriesMangas.mangaId],
    references: [mangas.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  mangaLinks: many(categoryMangas),
}));

export const categoryMangasRelations = relations(categoryMangas, ({ one }) => ({
  category: one(categories, {
    fields: [categoryMangas.categoryId],
    references: [categories.id],
  }),
  manga: one(mangas, {
    fields: [categoryMangas.mangaId],
    references: [mangas.id],
  }),
  series: one(series, {
    fields: [categoryMangas.serieId],
    references: [series.id],
  }),
}));

export const savedImagesRelations = relations(savedImages, ({ one }) => ({
  manga: one(mangas, {
    fields: [savedImages.mangaId],
    references: [mangas.id],
  }),
}));
