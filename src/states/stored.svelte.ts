import { getCurrentWindow } from "@tauri-apps/api/window";
import { type } from "@tauri-apps/plugin-os";
import { load, Store } from "@tauri-apps/plugin-store";
import type { Languages } from "@/types";

let settingsStore: Store | null = null;
let serverStore: Store | null = null;
let fetchedStore: Store | null = null;
let defaultData: Record<string, any> = null!;
let loadingPromise: Promise<Record<string, any>> | null = null;
const window = getCurrentWindow();

const getBefore = async (
  key: string,
  defaultValue: any,
  store: Store | null,
  storePath: string,
) => {
  if (store === null) store = await load(storePath);
  if (defaultData === null && storePath === "settings.json") {
    if (loadingPromise === null) {
      loadingPromise = store.entries().then((entries) => {
        defaultData = Object.fromEntries(entries);
        return defaultData;
      });
    }
    await loadingPromise;
    return defaultData[key] ?? defaultValue;
  } else {
    return (await store.get(key)) ?? defaultValue;
  }
};

const writeValue = async (
  key: string,
  value: any,
  store: Store | null,
  storePath: string,
) => {
  if (store === null) store = await load(storePath);
  await store.set(key, value);
};

class StoredState<T> {
  #value: T;
  #key: string;
  #defaultValue: T;
  #alternatives: T[];
  onchange: (_: T) => void;
  #store: Store | null;
  #storePath: string;

  constructor(config: {
    key: string;
    defaultValue: T;
    alternatives?: T[];
    onchange?: (_: T) => void;
    store?: Store | null;
    storePath?: string;
  }) {
    this.#value = $state(config.defaultValue);
    this.#key = config.key;
    this.#defaultValue = config.defaultValue;
    this.#alternatives = config.alternatives ?? [];
    this.onchange = config.onchange ?? (() => { });
    this.#store = config.store ?? settingsStore;
    this.#storePath = config.storePath ?? "settings.json";
    getBefore(this.#key, this.#defaultValue, this.#store, this.#storePath).then(
      (value: T) => {
        this.#value = value;
      },
    );
  }

  get value() {
    return this.#value;
  }

  set value(v) {
    this.#value = v;
    writeValue(this.#key, this.#value, this.#store, this.#storePath);
    this.onchange(this.#value);
  }

  resetValue = () => {
    this.#value = this.#defaultValue;
    writeValue(this.#key, this.#defaultValue, this.#store, this.#storePath);
    this.onchange(this.#value);
  };

  toggle = () => {
    if (this.#alternatives.length === 2) {
      this.#value =
        this.#value === this.#alternatives[0]
          ? this.#alternatives[1]
          : this.#alternatives[0];
      writeValue(this.#key, this.#value, this.#store, this.#storePath);
      this.onchange(this.#value);
    } else throw new Error("More or less than 2 options were passed");
  };

  cycle = () => {
    if (this.#alternatives.length > 1) {
      const currentIndex = this.#alternatives.indexOf(this.#value);
      const next = (currentIndex + 1) % this.#alternatives.length;
      this.#value = this.#alternatives[next];
      writeValue(this.#key, this.#value, this.#store, this.#storePath);
      this.onchange(this.#value);
    } else throw new Error("Less than 2 options were passed");
  };
}

// Store
export const enabledSources = new StoredState<Record<string, boolean>>({
  key: "enabled_sources",
  defaultValue: {},
  store: serverStore,
  storePath: "server.json",
});
export const hiddenExtensions = new StoredState<Record<string, boolean>>({
  key: "hidden_extensions",
  defaultValue: {},
  store: serverStore,
  storePath: "server.json",
});
export const hiddenSources = new StoredState<Record<string, boolean>>({
  key: "hidden_sources",
  defaultValue: {},
  store: serverStore,
  storePath: "server.json",
});

export const repoInfo = new StoredState<
  Record<string, { name: string; website: string }>
>({
  key: "repo_info",
  defaultValue: {},
  store: fetchedStore,
  storePath: "fetched.json",
});

// Preferences cache
export const showExtensionsNsfw = new StoredState<boolean>({
  key: "show_extensions_nsfw",
  defaultValue: false,
  alternatives: [true, false],
});
export const activeExtensionRepos = new StoredState<string[]>({
  key: "active_extension_repos",
  defaultValue: [],
});
export const allowedExtensionLanguages = new StoredState<
  Record<string, boolean>
>({
  key: "allowed_extension_languages",
  defaultValue: {},
});
export const allowedSourceLanguages = new StoredState<Record<string, boolean>>({
  key: "allowed_source_languages",
  defaultValue: {},
});
export const showOnlyWithChapter = new StoredState<boolean>({
  key: "show_only_with_chapter",
  defaultValue: false,
  alternatives: [true, false],
});
export const libraryAscending = new StoredState<boolean>({
  key: "library_ascending",
  defaultValue: false,
  alternatives: [true, false],
});
export const chaptersAscending = new StoredState<boolean>({
  key: "chapters_ascending",
  defaultValue: false,
  alternatives: [true, false],
});
export const orderLibraryBy = new StoredState<string>({
  key: "order_library_by",
  defaultValue: "id",
  alternatives: ["id", "date"],
});
export const openReadMenu = new StoredState<boolean>({
  key: "open_read_menu",
  defaultValue: true,
  alternatives: [true, false],
});

// export const chaptersCache = writable<(ReadCache & { chapters: Chapter[]; images: string[] })[]>([]);

// Appearance
export const themeMode = new StoredState<"dark" | "light">({
  key: "theme_mode",
  defaultValue: "dark",
  alternatives: ["light", "dark"],
});
export const retroMode = new StoredState<boolean>({
  key: "retro_mode",
  defaultValue: false,
  alternatives: [true, false],
});
export const sidebarOnRight = new StoredState<boolean>({
  key: "sidebar_right",
  defaultValue: false,
  alternatives: [true, false],
});
export const sidebarStyle = new StoredState<
  "collapsed" | "expanded" | "expand-on-hover"
>({ key: "sidebar_style", defaultValue: "collapsed" });
export const customTitlebar = new StoredState<boolean>({
  key: "custom_titlebar",
  defaultValue: type() !== "macos",
  alternatives: [true, false],
  onchange: (v) => {
    window.isDecorated().then((isDecorated) => {
      if (isDecorated && !v) {
        window.setDecorations(false);
      }
      if (!isDecorated && v) {
        window.setDecorations(true);
      }
    });
  },
});

// Behavior
export const closeToTray = new StoredState<boolean>({
  key: "close_tray",
  defaultValue: false,
  alternatives: [true, false],
});
export const openFavoriteChapter = new StoredState<boolean>({
  key: "open_favorite_chapter",
  defaultValue: false,
  alternatives: [true, false],
});
export const notifyChaptersUpdate = new StoredState<boolean>({
  key: "notify_chapter_updates",
  defaultValue: true,
  alternatives: [true, false],
});
export const taskbarCountFavorites = new StoredState<boolean>({
  key: "taskbar_count_favorites",
  defaultValue: true,
  alternatives: [true, false],
});

// System
export const appLanguage = new StoredState<Languages>({
  key: "app_language",
  defaultValue: "English",
});
export const downloadPath = new StoredState<string>({
  key: "download_path",
  defaultValue: "Mangas/",
});

export const suwayomiUrl = new StoredState<string>({
  key: "suwayomi_url",
  defaultValue: "http://127.0.0.1:4567",
});

// Reader
export const markAsRead = new StoredState<"manual" | "start" | "end">({
  key: "mark_as_read",
  defaultValue: "start",
});
export const cacheReading = new StoredState<boolean>({
  key: "cache_reading",
  defaultValue: true,
  alternatives: [true, false],
});
export const autoEnterFullscreen = new StoredState<boolean>({
  key: "auto_enter_fullscreen",
  defaultValue: true,
  alternatives: [true, false],
});
export const readerClock = new StoredState<boolean>({
  key: "reader_clock",
  defaultValue: false,
  alternatives: [true, false],
});

export const showCurrentChapter = new StoredState<boolean>({
  key: "show_current_chapter",
  defaultValue: false,
  alternatives: [true, false],
});
export const chapterPagesCounter = new StoredState<boolean>({
  key: "chapter_pages_counter",
  defaultValue: true,
  alternatives: [true, false],
});
export const chapterPercentageNumber = new StoredState<boolean>({
  key: "chapter_percentage_number",
  defaultValue: false,
  alternatives: [true, false],
});
export const chapterPercentageGraph = new StoredState<boolean>({
  key: "chapter_percentage_graph",
  defaultValue: false,
  alternatives: [true, false],
});

// export const isChaptersUniqueNumber = writable<boolean>(false);
// export const libraryFavorites = writable<Favorite[]>([]);
//
// const SETTINGS_SCHEMA: Record<string, SettingConfig> = {
//   selected_source: { store: selectedSource, default: "Atsumaru" },
//   activated_sources: { store: activatedSources, default: [...MANGASOURCES.map(s => s.name), ...COMICSOURCES.map(s => s.name), ...ANIMESOURCES.map(s => s.name)] },
//   auto_search_updates: { store: autoSearchUpdates, default: true },
//   preferable_language: {
//     store: preferableLanguage,
//     default: { id: "en", label: "English" },
//   },
//   auto_open_fullscreen: { store: autoEnterFullscreen, default: true },
//   theme: { store: theme, default: "dark" },
//   language: { store: appLanguage, default: "en" },
//   order_by: { store: libraryOrder, default: "id" },
//   last_page: { store: lastPage, default: "/home" },
//   view_mode: { store: viewMode, default: "single" },
//   fit_mode: { store: fitMode, default: "width" },
//   zoom_level: { store: zoomLevel, default: 100 },
//   open_read_menu: { store: openReadMenu, default: true },
//   is_chapters_unique_number: { store: isChaptersUniqueNumber, default: false },
//   is_chapters_descending: { store: isChaptersDescending, default: true },
//   chapter_pages_counter: { store: chapterPagesCounter, default: true },
//   chapter_percentage: { store: chapterPercentage, default: false },
//   reader_clock: { store: readerClock, default: false },
//   show_current_chapter: { store: showCurrentChapter, default: false },
//   mark_readed: { store: markReaded, default: "start" },
//   keep_reading: { store: keepReading, default: true },
//   notify_update: { store: notifyUpdate, default: true },
//   black_white_mode: { store: blackWhiteMode, default: false },
//   contrast: { store: contrast, default: 1 },
//   brightness: { store: brightness, default: 1 },
//   saturation: { store: saturation, default: 1 },
//   sepia: { store: sepia, default: 0 },
//   use_filter: { store: useFilter, default: false },
//   filter_reader: { store: filterReader, default: false },
//   filter: { store: filter, default: "bg-amber-500/20" },
//   download_path: { store: downloadPath, default: "Mangas/" },
//   discord_integration: { store: discordIntegration, default: false },
//   sidebar_behavior: { store: sidebarBehavior, default: "collapse" },
//   sidebar_side: { store: sidebarSide, default: "left" },
//   open_favorite_chapter: { store: openFavoriteChapter, default: false },
//   custom_titlebar: { store: customTitlebar, default: true },
//   show_count_icon: { store: showCountIcon, default: true },
//   show_count_icon_tray: { store: showCountIconTray, default: false },
//   notify_favorites: { store: notifyFavorites, default: true },
//   custom_notificator: { store: customNotificator, default: false },
//   window_effects: { store: windowEffects, default: false },
//   blur_effects: { store: blurEffects, default: true },
// } as const;
//
