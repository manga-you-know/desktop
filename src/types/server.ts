export type Extension = {
  pkgName: string;
  name: string;
  lang: string;
  versionCode: string;
  versionName: string;
  iconUrl: string;
  repo: string;
  isNsfw: boolean;
  isInstalled: boolean;
  isObsolete: boolean;
  hasUpdate: boolean;
};

export type SourceMeta = {
  sourceId: string;
  key: string;
  value: string;
};

export type Source = {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  iconUrl: string;
  isNsfw: boolean;
  isConfigurable: boolean;
  supportsLatest: boolean;
  meta: SourceMeta[];
  extension: {
    pkgName: string;
    repo: string;
    isObsolete: boolean;
    hasUpdate: boolean;
  };
};

export type CheckBoxPreference = {
  type: "CheckBoxPreference";
  CheckBoxCheckBoxCurrentValue: boolean;
  summary: string;
  CheckBoxDefault: boolean;
  key: string;
  CheckBoxTitle: string;
};

export type EditTextPreference = {
  type: "EditTextPreference";
  EditTextPreferenceCurrentValue: string;
  EditTextPreferenceDefault: string;
  EditTextPreferenceTitle: string;
  text: string;
  summary: string;
  key: string;
  dialogTitle: string;
  dialogMessage: string;
};

export type SwitchPreference = {
  type: "SwitchPreference";
  SwitchPreferenceCurrentValue: boolean;
  summary: string;
  key: string;
  SwitchPreferenceDefault: boolean;
  SwitchPreferenceTitle: string;
};

export type MultiSelectListPreference = {
  type: "MultiSelectListPreference";
  dialogMessage: string;
  dialogTitle: string;
  MultiSelectListPreferenceTitle: string;
  summary: string;
  key: string;
  entryValues: string[];
  entries: string[];
  MultiSelectListPreferenceDefault: string[];
  MultiSelectListPreferenceCurrentValue: string[];
};

export type ListPreference = {
  type: "ListPreference";
  ListPreferenceCurrentValue: string;
  ListPreferenceDefault: string;
  ListPreferenceTitle: string;
  summary: string;
  key: string;
  entryValues: string[];
  entries: string[];
};

export type Preference =
  | CheckBoxPreference
  | EditTextPreference
  | SwitchPreference
  | MultiSelectListPreference
  | ListPreference;

export type SourceSettings = {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  preferences: Preference[];
};

export type PreferenceChange =
  | { position: number; checkBoxState: boolean }
  | { position: number; switchState: boolean }
  | { position: number; editTextState: string }
  | { position: number; listState: string }
  | { position: number; multiSelectState: string[] };

export type UpdateSourcePreferencesInput = {
  source: string;
  change: PreferenceChange;
};

export type CheckBoxFilter = {
  type: "CheckBoxFilter";
  CheckBoxFilterDefault: boolean;
  name: string;
};

export type HeaderFilter = {
  type: "HeaderFilter";
  name: string;
};

export type SelectFilter = {
  type: "SelectFilter";
  SelectFilterDefault: number;
  name: string;
  values: string[];
};

export type TriStateFilter = {
  type: "TriStateFilter";
  TriStateFilterDefault: number;
  name: string;
};

export type TextFilter = {
  type: "TextFilter";
  TextFilterDefault: string;
  name: string;
};

export type SortFilterDefault = {
  ascending: boolean;
  index: number;
};

export type SortFilter = {
  type: "SortFilter";
  SortFilterDefault: SortFilterDefault | null;
  name: string;
  values: string[];
};

export type SeparatorFilter = {
  type: "SeparatorFilter";
  name: string;
};

export type GroupFilter = {
  type: "GroupFilter";
  name: string;
  filters: Exclude<SourceFilter, GroupFilter>[];
};

export type SourceFilter =
  | CheckBoxFilter
  | HeaderFilter
  | SelectFilter
  | TriStateFilter
  | TextFilter
  | SortFilter
  | SeparatorFilter
  | GroupFilter;

export type SourceBrowse = {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  iconUrl: string;
  baseUrl: string;
  isConfigurable: boolean;
  supportsLatest: boolean;
  meta: SourceMeta[];
  filters: SourceFilter[];
};

export type MangaStatus =
  | "ONGOING"
  | "COMPLETED"
  | "LICENSED"
  | "PUBLISHING_FINISHED"
  | "CANCELLED"
  | "ON_HIATUS"
  | "UNKNOWN";

export type MangaFetch = {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  thumbnailUrlLastFetched: number;
  inLibrary: boolean;
  initialized: boolean;
  sourceId: string;
  genre: string[];
  lastFetchedAt: number;
  inLibraryAt: number;
  status: MangaStatus;
  artist: string | null;
  author: string | null;
  description: string | null;
  realUrl: string | null;
  meta: MangaMeta[];
};

export type FetchSourceMangaType = "POPULAR" | "LATEST" | "SEARCH";

export type FilterChange =
  | { position: number; checkBoxState: boolean }
  | { position: number; triStateState: number }
  | { position: number; textState: string }
  | { position: number; selectState: number }
  | { position: number; sortState: { ascending: boolean; index: number } }
  | {
    position: number;
    groupChange: FilterChange;
  };

export type FetchSourceMangaInput = {
  type: FetchSourceMangaType;
  source: string;
  page: number;
  query?: string;
  filters?: FilterChange[];
};

export type FetchSourceMangaResult = {
  hasNextPage: boolean;
  mangas: MangaFetch[];
};

export type MangaMeta = {
  mangaId: number;
  key: string;
  value: string;
};

export interface SourceBase {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  iconUrl: string;
}

export interface ChapterRef {
  id: number;
  sourceOrder?: number;
  isRead?: boolean;
  mangaId?: number;
  chapterNumber?: number;
  name?: string;
  scanlator?: string | null;
  lastReadAt?: string;
  fetchedAt?: string;
  uploadDate?: string;
}

export interface TrackRecord {
  id: number;
  trackerId: number;
}

export interface MangaScreen {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  thumbnailUrlLastFetched: number;
  inLibrary: boolean;
  initialized: boolean;
  sourceId: string;
  unreadCount: number;
  downloadCount: number;
  bookmarkCount: number;
  hasDuplicateChapters: boolean;
  chapters: {
    totalCount: number;
  };
  firstUnreadChapter: ChapterRef | null;
  lastReadChapter: ChapterRef | null;
  latestReadChapter: ChapterRef | null;
  latestFetchedChapter: ChapterRef | null;
  latestUploadedChapter: ChapterRef | null;
  highestNumberedChapter: ChapterRef | null;
  genre: string[];
  lastFetchedAt: number;
  inLibraryAt: number;
  status: MangaStatus;
  artist: string | null;
  author: string | null;
  description: string | null;
  realUrl: string | null;
  meta: MangaMeta[];
  source: SourceBase;
  trackRecords: {
    totalCount: number;
    nodes: TrackRecord[];
  };
}

export type SourceOrderByType = "ASC" | "DESC";

export interface ChapterOrderInput {
  by: "SOURCE_ORDER" | "CHAPTER_NUMBER" | "UPLOAD_DATE" | "FETCHED_AT" | "NAME";
  byType: SourceOrderByType;
}

export interface ChapterConditionInput {
  mangaId?: number;
  id?: number;
  isRead?: boolean;
  isDownloaded?: boolean;
  isBookmarked?: boolean;
}

export interface ChapterFilterInput {
  name?: { likeInsensitive?: string };
  scanlator?: { likeInsensitive?: string };
}

export interface ChapterListItem {
  // CHAPTER_BASE_FIELDS
  id: number;
  name: string;
  mangaId: number;
  scanlator: string | null;
  realUrl: string | null;
  sourceOrder: number;
  chapterNumber: number;

  // CHAPTER_STATE_FIELDS
  isRead: boolean;
  isDownloaded: boolean;
  isBookmarked: boolean;

  // CHAPTER_LIST_FIELDS extras
  fetchedAt: string;
  uploadDate: string;
  lastReadAt: string;
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
}

export interface ChapterList {
  nodes: ChapterListItem[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface GetChaptersMangaVariables {
  after?: string;
  before?: string;
  condition?: ChapterConditionInput;
  filter?: ChapterFilterInput;
  first?: number;
  last?: number;
  offset?: number;
  order?: ChapterOrderInput[];
}

export interface RefreshMangaVariables {
  id: number;
  fetchManga: boolean;
  fetchChapters: boolean;
}

export interface RefreshMangaResult {
  manga: MangaScreen | null;
  chapters: ChapterListItem[] | null;
}
