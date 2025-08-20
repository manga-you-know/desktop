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
  showCountIcon,
  notifyFavorites,
  customNotificator,
  windowEffects,
  blurEffects,
  showCountIconTray,
  chapterPagesCounter,
  chapterPercentage,
  readerClock,
  showCurrentChapter,
  markReaded,
  keepReading,
  filter,
  useFilter,
  blackWhiteMode,
  contrast,
  brightness,
  saturation,
  sepia,
  filterReader,
  downloadPath,
} from "@/store";
import { goto } from "$app/navigation";
import type { Language } from "@/types";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";
import { updateBadge, addBlurWindow, removeBlurWindow, removeCountIcon, verifyCustomNotificator } from "@/functions";
import { toast } from "svelte-sonner";

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
  | "start"
  | "end"
  | "auto"
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
  chapter_pages_counter: { store: chapterPagesCounter, default: true },
  chapter_percentage: { store: chapterPercentage, default: false },
  reader_clock: { store: readerClock, default: false },
  show_current_chapter: { store: showCurrentChapter, default: false },
  mark_readed: { store: markReaded, default: "start" },
  keep_reading: { store: keepReading, default: true },
  notify_update: { store: notifyUpdate, default: true },
  black_white_mode: { store: blackWhiteMode, default: false },
  contrast: { store: contrast, default: 1 },
  brightness: { store: brightness, default: 1 },
  saturation: { store: saturation, default: 1 },
  sepia: { store: sepia, default: 0 },
  use_filter: { store: useFilter, default: false },
  filter_reader: { store: filterReader, default: false },
  filter: { store: filter, default: "bg-amber-500/20" },
  download_path: { store: downloadPath, default: "Mangas/" },
  discord_integration: { store: discordIntegration, default: false },
  sidebar_behavior: { store: sidebarBehavior, default: "collapse" },
  custom_titlebar: { store: customTitlebar, default: true },
  show_count_icon: { store: showCountIcon, default: true },
  show_count_icon_tray: { store: showCountIconTray, default: false },
  notify_favorites: { store: notifyFavorites, default: true },
  custom_notificator: { store: customNotificator, default: false },
  window_effects: { store: windowEffects, default: false },
  blur_effects: { store: blurEffects, default: true },
} as const;

async function ensureConnected() {
  if (!loadedSettings) loadedSettings = await load("settings.json");
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
      store.set(data[key] !== undefined ? data[key] : defaultValue);
    }
  );
  if (get(lastPage) !== "/home") goto(get(lastPage));
  const isDecorated = await window.isDecorated();
  if (get(customTitlebar)) {
    if (isDecorated) window.setDecorations(false);
  } else {
    if (!isDecorated) {
      window.setDecorations(true);
    }
  }
  if (get(showCountIcon)) {
    updateBadge();
  } else {
    removeCountIcon();
  }
  if (get(windowEffects)) {
    addBlurWindow();
  } else {
    removeBlurWindow();
  }
  if (get(downloadPath) === "Mangas") {
    downloadPath.set("Mangas/")
  }
  verifyCustomNotificator();
}

export async function saveSettings() {
  await ensureConnected();
  await Promise.all(
    Object.entries(SETTINGS_SCHEMA).map(async ([key, { store }]) =>
      await loadedSettings.set(key, get(store))
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
  if (get(showCountIcon)) {
    updateBadge();
  } else {
    removeCountIcon();
  }
  if (get(windowEffects)) {
    addBlurWindow();
  } else {
    removeBlurWindow();
  }
  verifyCustomNotificator();
}

export async function resetSettings() {
  await ensureConnected();
  await Promise.all(
    Object.entries(SETTINGS_SCHEMA).map(([key, { default: defaultValue }]) =>
      loadedSettings.set(key, defaultValue)
    )
  );
  await loadSettings();
  toast.success("Settings reseted!")
}
