import { getCurrentWindow } from "@tauri-apps/api/window";
import { type } from "@tauri-apps/plugin-os";
import { load, Store } from "@tauri-apps/plugin-store";
import type { Languages } from "@/types";

let settingsStore: Store | null = null
let defaultData: Record<string, any> = null!
let loadingPromise: Promise<Record<string, any>> | null = null
const window = getCurrentWindow();

const getBefore = async (key: string, defaultValue: any) => {
  if (settingsStore === null)
    settingsStore = await load("settings.json")
  if (defaultData === null) {
    if (loadingPromise === null) {
      loadingPromise = settingsStore.entries().then(entries => {
        defaultData = Object.fromEntries(entries)
        return defaultData
      })
    }
    await loadingPromise
  }
  return defaultData[key] ?? defaultValue
}

const writeValue = async (key: string, value: any) => {
  if (settingsStore === null)
    settingsStore = await load("settings.json")
  await settingsStore.set(key, value)
}

class StoredState<T> {
  #value: T;
  #key: string;
  #defaultValue: T;
  #options: T[];
  #onChange: (_: T) => void

  constructor(key: string, defaultValue: T, options: T[] = [], onChange = (_: T) => { }) {
    this.#value = $state(defaultValue)
    this.#key = key
    this.#defaultValue = defaultValue
    this.#options = options
    this.#onChange = onChange
    getBefore(this.#key, defaultValue)
      .then((value: T) => { this.#value = value })
  }

  get value() {
    return this.#value
  }

  set value(v) {
    this.#value = v
    writeValue(this.#key, this.#value)
    this.#onChange(this.#value)
  }

  resetValue = () => {
    this.#value = this.#defaultValue
    writeValue(this.#key, this.#defaultValue)
    this.#onChange(this.#value)
  }

  toggle = () => {
    if (this.#options.length === 2) {
      this.#value = this.#value === this.#options[0] ? this.#options[1] : this.#options[0];
      writeValue(this.#key, this.#value)
      this.#onChange(this.#value)
    } else throw new Error("More or less than 2 options were passed")
  }

  cycle = () => {
    if (this.#options.length > 1) {
      const currentIndex = this.#options.indexOf(this.#value);
      const next = (currentIndex + 1) % this.#options.length;
      this.#value = this.#options[next];
      writeValue(this.#key, this.#value)
      this.#onChange(this.#value)
    } else throw new Error("Less than 2 options were passed")
  }
}


//  Cache 
export const showOnlyWithChapter = new StoredState<boolean>("show_only_with_chapter", false, [true, false])
export const libraryAscending = new StoredState<boolean>("library_ascending", false, [true, false])
export const chaptersAscending = new StoredState<boolean>("chapters_ascending", false, [true, false])
export const orderLibraryBy = new StoredState<string>("order_library_by", "id", ["id", "date"])
export const openReadMenu = new StoredState<boolean>("open_read_menu", true, [true, false])

// export const chaptersCache = writable<(ReadCache & { chapters: Chapter[]; images: string[] })[]>([]);

// Appearance 
export const themeMode = new StoredState<"dark" | "light">("theme_mode", "dark", ["light", "dark"])
export const retroMode = new StoredState<boolean>("retro_mode", false, [true, false])
export const sidebarOnRight = new StoredState<boolean>("sidebar_right", false, [true, false])
export const sidebarStyle = new StoredState<"collapsed" | "expanded" | "expand-on-hover">("sidebar_style", "collapsed")
export const customTitlebar = new StoredState<boolean>("custom_titlebar", type() !== "macos", [true, false], (v) => {
  window.isDecorated().then(isDecorated => {
    if (isDecorated && !v) {
      window.setDecorations(false)
    }
    if (!isDecorated && v) {
      window.setDecorations(true)
    }
  })
})

// Behavior
export const closeToTray = new StoredState<boolean>("close_tray", false, [true, false])
export const openFavoriteChapter = new StoredState<boolean>("open_favorite_chapter", false, [true, false])
export const notifyChaptersUpdate = new StoredState<boolean>("notify_chapter_updates", true, [true, false])
export const taskbarCountFavorites = new StoredState<boolean>("taskbar_count_favorites", true, [true, false])


// System
export const appLanguage = new StoredState<Languages>("app_language", "English")
export const downloadPath = new StoredState<string>("download_path", "Mangas/")

// Reader
export const markAsRead = new StoredState<"manual" | "start" | "end">("mark_as_read", "start")
export const cacheReading = new StoredState<boolean>("cache_reading", true, [true, false])
export const autoEnterFullscreen = new StoredState<boolean>("auto_enter_fullscreen", true, [true, false])
export const readerClock = new StoredState<boolean>("reader_clock", false, [true, false])
export const showCurrentChapter = new StoredState<boolean>("show_current_chapter", false, [true, false])
export const chapterPagesCounter = new StoredState<boolean>("chapter_pages_counter", true, [true, false])
export const chapterPercentageNumber = new StoredState<boolean>("chapter_percentage_number", false, [true, false])
export const chapterPercentageGraph = new StoredState<boolean>("chapter_percentage_graph", false, [true, false])

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

