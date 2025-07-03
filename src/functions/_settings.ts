import { load, Store } from "@tauri-apps/plugin-store";
import { get, type Writable } from "svelte/store";
import {
  selectedSource,
  libraryOrder,
  isAscending,
  autoSearchUpdates,
  preferableLanguage,
  autoEnterFullscreen,
  theme,
  appLanguage,
  lastPage,
  useMpv,
  closeTray,
  showOnlyNew,
  fitMode,
  viewMode,
  zoomLevel,
  openReadMenu,
  isChaptersDescending,
  notifyUpdate,
  discordIntegration,
  sidebarBehavior,
  customTitlebar,
} from "@/store";
import { goto } from "$app/navigation";
import type { Language } from "@/types";
import { refreshLibrary } from "@/functions/_database";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";

let loadedSettings: Store;
const window = getCurrentWindow();

type SettingValue =
  | string
  | boolean
  | number
  | Language
  | "dark"
  | "light"
  | "single"
  | "scroll"
  | ""
  | "width"
  | "on-hover"
  | "expand"
  | "collapse"
  | undefined;

interface SettingConfig {
  store: Writable<SettingValue>;
  default: SettingValue;
}

const SETTINGS_SCHEMA: Record<string, SettingConfig> = {
  selected_source: { store: selectedSource, default: "MangaFire" },
  auto_search_updates: { store: autoSearchUpdates, default: true },
  preferable_language: {
    store: preferableLanguage,
    default: { id: "en", label: "English" },
  },
  auto_open_fullscreen: { store: autoEnterFullscreen, default: true },
  theme: { store: theme, default: "dark" },
  language: { store: appLanguage, default: "en" },
  order_by: { store: libraryOrder, default: "id" },
  is_ascending: { store: isAscending, default: true },
  last_page: { store: lastPage, default: "/home" },
  use_mpv: { store: useMpv, default: false },
  close_tray: { store: closeTray, default: false },
  show_only_new: { store: showOnlyNew, default: false },
  view_mode: { store: viewMode, default: "single" },
  fit_mode: { store: fitMode, default: "width" },
  zoom_level: { store: zoomLevel, default: 100 },
  open_read_menu: { store: openReadMenu, default: true },
  is_chapters_descending: { store: isChaptersDescending, default: true },
  notify_update: { store: notifyUpdate, default: true },
  discord_integration: { store: discordIntegration, default: false },
  sidebar_behavior: { store: sidebarBehavior, default: "expand" },
  custom_titlebar: { store: customTitlebar, default: true },
} as const;

async function connectSettings() {
  loadedSettings = await load("settings.json");
}

async function ensureConnected() {
  if (!loadedSettings) await connectSettings();
}

export function saveScreenState() {
  saveWindowState(StateFlags.FULLSCREEN);
  saveWindowState(StateFlags.SIZE);
  saveWindowState(StateFlags.DECORATIONS);
  saveWindowState(StateFlags.MAXIMIZED);
  saveWindowState(StateFlags.POSITION);
}

export async function loadSettings() {
  await ensureConnected();
  const data = Object.fromEntries(await loadedSettings.entries()) as Record<
    string,
    SettingValue
  >;
  Object.entries(SETTINGS_SCHEMA).forEach(
    ([key, { store, default: defaultValue }]) => {
      store.set(data[key] ?? defaultValue);
    }
  );
  refreshLibrary();
  if (get(lastPage) !== "/home") goto(get(lastPage));
  const isDecorated = await window.isDecorated();
  if (get(customTitlebar)) {
    if (isDecorated) window.setDecorations(false);
  } else {
    if (!isDecorated) {
      window.setDecorations(true);
    }
  }
}

export async function saveSettings() {
  await ensureConnected();
  await Promise.all(
    Object.entries(SETTINGS_SCHEMA).map(([key, { store }]) =>
      loadedSettings.set(key, get(store))
    )
  );
  const isDecorated = await window.isDecorated();
  if (get(customTitlebar)) {
    if (isDecorated) window.setDecorations(false);
  } else {
    if (!isDecorated) {
      window.setDecorations(true);
    }
  }
}

export async function resetSettings() {
  await ensureConnected();
  await Promise.all(
    Object.entries(SETTINGS_SCHEMA).map(([key, { default: defaultValue }]) =>
      loadedSettings.set(key, defaultValue)
    )
  );
  await loadSettings();
}
