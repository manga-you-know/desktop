scalar LongString

scalar Upload

enum FetchSourceMangaType {
  SEARCH
  POPULAR
  LATEST
}

enum MangaStatus {
  ONGOING
  COMPLETED
  LICENSED
  PUBLISHING_FINISHED
  CANCELLED
  ON_HIATUS
  UNKNOWN
}

type Settings {
  extensionRepos: [String!]!
}

input SettingsInput {
  extensionRepos: [String!]!
}

input SetSettingsInput {
  settings: SettingsInput!
}

type SetSettingsPayload {
  settings: Settings!
}

type Extension {
  pkgName: String!
  name: String!
  lang: String!
  versionCode: String!
  versionName: String!
  iconUrl: String!
  repo: String!
  storeIndexUrl: String
  isNsfw: Boolean!
  contentWarning: String
  isInstalled: Boolean!
  isObsolete: Boolean!
  hasUpdate: Boolean!
}

input FetchExtensionsInput {
  dummy: Boolean
}

type FetchExtensionsPayload {
  extensions: [Extension!]!
}

input UpdateExtensionPatchInput {
  install: Boolean
  uninstall: Boolean
  update: Boolean
}

input UpdateExtensionInput {
  id: String!
  patch: UpdateExtensionPatchInput!
}

type UpdateExtensionPayload {
  extension: Extension!
}

type SourceMeta {
  sourceId: String!
  key: String!
  value: String!
}

type MangaMeta {
  mangaId: Int!
  key: String!
  value: String!
}

type SortSelection {
  ascending: Boolean!
  index: Int!
}

interface Filter {
  name: String!
}

type CheckBoxFilter implements Filter {
  name: String!
  default: Boolean!
}

type HeaderFilter implements Filter {
  name: String!
}

type SelectFilter implements Filter {
  name: String!
  default: Int!
  values: [String!]!
}

type TriStateFilter implements Filter {
  name: String!
  default: Int!
}

type TextFilter implements Filter {
  name: String!
  default: String!
}

type SortFilter implements Filter {
  name: String!
  default: SortSelection
  values: [String!]!
}

type SeparatorFilter implements Filter {
  name: String!
}

type GroupFilter implements Filter {
  name: String!
  filters: [Filter!]!
}

interface Preference {
  key: String!
  summary: String
}

type CheckBoxPreference implements Preference {
  key: String!
  summary: String
  default: Boolean!
  currentValue: Boolean!
  title: String!
}

type EditTextPreference implements Preference {
  key: String!
  summary: String
  default: String!
  currentValue: String!
  title: String!
  text: String
  dialogTitle: String!
  dialogMessage: String!
}

type SwitchPreference implements Preference {
  key: String!
  summary: String
  default: Boolean!
  currentValue: Boolean!
  title: String!
}

type MultiSelectListPreference implements Preference {
  key: String!
  summary: String
  default: [String!]!
  currentValue: [String!]!
  title: String!
  dialogMessage: String!
  dialogTitle: String!
  entryValues: [String!]!
  entries: [String!]!
}

type ListPreference implements Preference {
  key: String!
  summary: String
  default: String!
  currentValue: String!
  title: String!
  entryValues: [String!]!
  entries: [String!]!
}

type SourceExtension {
  pkgName: String!
  repo: String!
}

type Source {
  id: LongString!
  name: String!
  displayName: String!
  lang: String!
  iconUrl: String
  baseUrl: String
  isNsfw: Boolean!
  isConfigurable: Boolean!
  supportsLatest: Boolean!
  meta: [SourceMeta!]!
  extension: SourceExtension!
  preferences: [Preference!]!
  filters: [Filter!]!
}

type SourceConnection {
  nodes: [Source!]!
}

input UpdateSourcePreferenceChangeInput {
  position: Int!
  multiSelectState: [String!]
  listState: String
  editTextState: String
  switchState: Boolean
  checkBoxState: Boolean
}

input UpdateSourcePreferenceInput {
  source: LongString!
  change: UpdateSourcePreferenceChangeInput!
}

type UpdateSourcePreferencePayload {
  source: Source!
}

input FilterChangeInput {
  position: Int!
  checkBoxState: Boolean
  triStateState: Int
  textState: String
  selectState: Int
  sortState: SortSelectionInput
  groupChange: FilterChangeInput
}

input SortSelectionInput {
  ascending: Boolean!
  index: Int!
}

input FetchSourceMangaInput {
  type: FetchSourceMangaType!
  source: LongString!
  page: Int!
  query: String
  filters: [FilterChangeInput!]
}

type Manga {
  id: Int!
  title: String!
  thumbnailUrl: String
  thumbnailUrlLastFetched: Int!
  inLibrary: Boolean!
  initialized: Boolean!
  sourceId: String!
  genre: [String!]!
  lastFetchedAt: Int!
  inLibraryAt: Int!
  status: MangaStatus!
  artist: String
  author: String
  description: String
  realUrl: String
  meta: [MangaMeta!]!
}

type FetchSourceMangaPayload {
  hasNextPage: Boolean!
  mangas: [Manga!]!
}

type Query {
  settings: Settings!
  sources: SourceConnection!
  source(id: LongString!): Source!
}

type Mutation {
  setSettings(input: SetSettingsInput!): SetSettingsPayload!
  fetchExtensions(input: FetchExtensionsInput = {  }): FetchExtensionsPayload!
  updateExtension(input: UpdateExtensionInput!): UpdateExtensionPayload!
  updateSourcePreference(input: UpdateSourcePreferenceInput!): UpdateSourcePreferencePayload!
  fetchSourceManga(input: FetchSourceMangaInput!): FetchSourceMangaPayload!
}