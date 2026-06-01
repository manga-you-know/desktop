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
