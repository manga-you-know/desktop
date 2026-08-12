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
import type { MangaStatus, ContentWarning } from "@/types/server";

export const mangas = sqliteTable(
  "mangas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slugTitle: text("slug_title"),
    currentCover: text("current_cover").notNull(),
    covers: text("covers", { mode: "json" }).$type<string[]>().default([]),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
    autoUpdate: integer("auto_update", { mode: "boolean" }).default(false),
    notifyUpdate: integer("notify_update", { mode: "boolean" }).default(false),
    sourceOrigin: text("source_origin").default(""), // {suwaSource.id}::{manga.title}
    type: text("type").default("manga"),
    notes: text("notes"),
    commentary: text("commentary"),
    rating: real("rating"),
    author: text("author"),
    artist: text("artist"),
    readingStatus: text("reading_status"),
    status: text("status").$type<MangaStatus>(),
    description: text("description"),
    otherTitles: text("other_titles", { mode: "json" })
      .$type<string[]>()
      .default([]),
    genre: text("genre", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    updatedAt: integer("update_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_mangas_slug_titles").on(t.slugTitle),
    index("idx_mangas_is_favorite").on(t.isFavorite),
    index("idx_mangas_is_hidden").on(t.isHidden),
    index("idx_mangas_is_anonymous").on(t.isAnonymous),
    index("idx_mangas_created_at").on(t.createdAt),
    index("idx_mangas_updated_at").on(t.updatedAt),
    index("idx_mangas_status").on(t.readingStatus),
    index("idx_mangas_rating").on(t.rating),
  ],
);

export const sources = sqliteTable(
  "sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceName: text("source_name").notNull(), // local source: "Local"
    extensionName: text("extension_name").notNull(),
    mangaSourceId: text("manga_source_id").notNull(), // local source: final path
    sourceId: text("source_id").notNull(), // local source: root path
    extensionId: text("extension_id").notNull(), // local source: "local=" + type of media (cbz, pdf, folder images)
    iconUrl: text("iconUrl"),
    chaptersCount: integer("chapters_count").notNull().default(0),
    unreadCount: integer("unread_count").notNull().default(0),
    bookmarkedCount: integer("bookmarked_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    downloadCount: integer("download_count").notNull().default(0),
    hasDuplicateChapters: integer("has_duplicate_chapters", { mode: "boolean" })
      .notNull()
      .default(false),
    contentWarning: text("content_warning").$type<ContentWarning>().notNull(),
    title: text("title").notNull(),
    language: text("language").notNull(),
    description: text("description"),
    author: text("author"),
    artist: text("artist"),
    realUrl: text("real_url").notNull(), // local source: path to open (root + final)
    status: text("status").$type<MangaStatus>(),
    genre: text("genre", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    coverUrl: text("cover_url").notNull(),
    coverUrlLastFetched: integer("cover_url_last_fetched", {
      mode: "timestamp",
    }).$defaultFn(() => new Date()),
    chaptersLastFetched: integer("chapters_last_fetched", {
      mode: "timestamp",
    }),
    lastFetchedChapterNumber: text("last_fetched_chapter_number"),
    dataLastFetched: integer("data_last_fetched", {
      mode: "timestamp",
    }).$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    enabled: integer("enabled", { mode: "boolean" }).default(true),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_sources_enabled").on(t.enabled),
    unique().on(t.sourceId, t.mangaSourceId),
    index("idx_sources_manga_source_id").on(t.mangaSourceId),
  ],
);

export const mangasSources = sqliteTable(
  "mangas_sources",
  {
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    sortIndex: integer("sort_index"),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    unique().on(t.mangaId, t.sourceId),
    index("idx_mangas_sources_manga_id").on(t.mangaId),
    index("idx_mangas_sources_source_id").on(t.sourceId),
  ],
);

export const chapters = sqliteTable(
  "chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    mangaSourceId: text("manga_source_id").notNull(),
    chapterId: text("chapter_id").notNull(), // local source:  final path in source path
    chapterNumber: text("chapter_number"),
    chapterTitle: text("chapter_title"),
    language: text("language"),
    scanlator: text("scanlator"),
    realUrl: text("real_url"),
    isBookmarked: integer("is_bookmarked", { mode: "boolean" }).default(false),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isDownloaded: integer("is_downloaded", { mode: "boolean" }).default(false),
    isRead: integer("is_read", { mode: "boolean" }).default(false),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
    sourceOrder: integer("source_order").notNull().default(0),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    readAt: integer("read_at", { mode: "timestamp" }),
    commentary: text("commentary"),
    pageCount: integer("page_cout"),
    rating: real("rating"),
    sortIndex: integer("sort_index"),
    fetchedAt: integer("fetched_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    uploadDate: integer("uploadDate", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date(0)),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    unique().on(t.chapterId, t.sourceId, t.language),
    index("idx_chapters_manga_source_id").on(t.mangaSourceId),
    index("idx_chapters_source_id").on(t.sourceId),
    index("idx_chapters_sort_index").on(t.sortIndex),
    index("idx_chapters_is_read").on(t.isRead),
    index("idx_chapters_is_favorite").on(t.isFavorite),
    index("idx_chapters_is_anonymous").on(t.isAnonymous),
    index("idx_chapters_is_hidden").on(t.isHidden),
    index("idx_chapters_read_at").on(t.readAt),
  ],
);

/* export const chapterChapter = sqliteTable("chapter_chapter", {
  chapterOriginId: integer("chapter_origin_id"),
  duplicateOf
}) */

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    description: text("description"),
    commentary: text("commentary"),
    rating: real("rating"),
    author: text("author"),
    artist: text("artist"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    genre: text("genre", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("update_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    meta: text("meta", { mode: "json" })
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
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    sortIndex: integer("sort_index"),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  meta: text("meta", { mode: "json" }).$type<Record<string, any>>().default({}),
});

export const categoriesMangas = sqliteTable(
  "categories_mangas",
  {
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, {
        onDelete: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    sortIndex: integer("sort_index"),
  },
  (t) => [
    unique().on(t.categoryId, t.mangaId),
    index("idx_categories_mangas_manga_id").on(t.mangaId),
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  meta: text("meta", { mode: "json" }).$type<Record<string, any>>().default({}),
});

export const savedPanels = sqliteTable(
  "saved_panels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mangaId: integer("manga_id").references(() => mangas.id, {
      onDelete: "set null",
    }),
    sourceId: integer("source_id").references(() => sources.id, {
      onDelete: "set null",
    }),
    chapterId: integer("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),
    path: text("path").notNull(),
    title: text("title"),
    note: text("note"),
    page: text("page"),
    mangaTitle: text("manga_title"),
    chapterTitle: text("chapter_title"),
    chapterNumber: text("chapter_number"),
    isCropped: integer("is_cropped", { mode: "boolean" }).default(false),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_saved_panels_manga_id").on(t.mangaId),
    index("idx_saved_panels_is_favorite").on(t.isFavorite),
    index("idx_saved_panels_is_hidden").on(t.isHidden),
  ],
);

type LogLevel = "LOW" | "NORMAL" | "HIGH" | "WARNING" | "ERROR";
type LogKind = "NEW_CHAPTERS" | "FETCH_ERROR";

export const logs = sqliteTable(
  "logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind").$type<LogKind>().notNull(),
    eventId: text("event_id")
      .notNull()
      .$defaultFn(() => Date.now().toString()),
    eventOrigin: text("event_origin").notNull().default("MIX"),
    title: text("title").notNull(),
    level: text("level").$type<LogLevel>().notNull().default("NORMAL"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    description: text("description").notNull(),
    note: text("note"),
    shouldNotify: integer("should_notify", { mode: "boolean" }).default(false),
    notifiedAt: integer("notified_at", { mode: "timestamp" }),
    loggedAt: integer("logged_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    meta: text("meta", { mode: "json" })
      .$type<Record<string, any>>()
      .default({}),
  },
  (t) => [
    index("idx_logs_kind").on(t.kind),
    index("idx_logs_logged_at").on(t.loggedAt),
    index("idx_logs_should_notify").on(t.shouldNotify),
  ],
);

export const mangasRelations = relations(mangas, ({ many }) => ({
  sourceLinks: many(mangasSources),
  seriesLinks: many(seriesMangas),
  categoryLinks: many(categoriesMangas),
  savedPanels: many(savedPanels),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  mangaLinks: many(mangasSources),
  chapters: many(chapters),
}));

export const mangasSourcesRelations = relations(mangasSources, ({ one }) => ({
  manga: one(mangas, {
    fields: [mangasSources.mangaId],
    references: [mangas.id],
  }),
  source: one(sources, {
    fields: [mangasSources.sourceId],
    references: [sources.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  source: one(sources, {
    fields: [chapters.sourceId],
    references: [sources.id],
  }),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  mangaLinks: many(seriesMangas),
}));

export const seriesMangasRelations = relations(seriesMangas, ({ one }) => ({
  serie: one(series, {
    fields: [seriesMangas.serieId],
    references: [series.id],
  }),
  manga: one(mangas, {
    fields: [seriesMangas.mangaId],
    references: [mangas.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  mangaLinks: many(categoriesMangas),
}));

export const categoryMangasRelations = relations(
  categoriesMangas,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoriesMangas.categoryId],
      references: [categories.id],
    }),
    manga: one(mangas, {
      fields: [categoriesMangas.mangaId],
      references: [mangas.id],
    }),
  }),
);

export const savedPanelsRelations = relations(savedPanels, ({ one }) => ({
  manga: one(mangas, {
    fields: [savedPanels.mangaId],
    references: [mangas.id],
  }),
}));
