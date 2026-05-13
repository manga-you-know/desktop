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
