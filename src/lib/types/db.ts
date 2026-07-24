import type {
  mangas,
  sources,
  chapters,
  series,
  seriesMangas,
  categories,
  categoryMangas,
  groups,
  savedImages,
  logs,
} from "../db";

export type Manga = typeof mangas.$inferSelect;
export type NewManga = typeof mangas.$inferInsert;

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type Serie = typeof series.$inferSelect;
export type NewSerie = typeof series.$inferInsert;

export type SeriesManga = typeof seriesMangas.$inferSelect;
export type NewSeriesManga = typeof seriesMangas.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type CategoryManga = typeof categoryMangas.$inferSelect;
export type NewCategoryManga = typeof categoryMangas.$inferInsert;

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type SavedImage = typeof savedImages.$inferSelect;
export type NewSavedImage = typeof savedImages.$inferInsert;

export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;

export type SourceNChapters = Source & { chapters: Chapter[] };
export type MangaNSources = Manga & { sources: SourceNChapters[] };

export type Operators = {
  equal?: string | number | boolean | Date;
  different?: string | number | boolean | Date;
  greaterThan?: string | number | Date;
  greaterThanOrEqual?: string | number | Date;
  lessThan?: string | number | Date;
  lessThanOrEqual?: string | number | Date;
  in?: (string | number | Date)[];
  notIn?: (string | number | Date)[];
  between?: [string | number | Date, string | number | Date];
  notBetween?: [string | number | Date, string | number | Date];
  like?: string;
  notLike?: string;
  ilike?: string;
  notIlike?: string;
  isNull?: boolean;
  isNotNull?: boolean;
};

export type FilterOf<T> = {
  [K in keyof T]?: Operators;
};

export type MangaFilter = FilterOf<Manga>;
