import { load, Store } from "@tauri-apps/plugin-store";

let settingsStore: Store | null = null
let defaultData: Record<string, any> = null!
let loadingPromise: Promise<Record<string, any>> | null = null

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

  constructor(key: string, defaultValue: T, options: T[] = []) {
    this.#value = $state(defaultValue)
    this.#key = key
    this.#defaultValue = defaultValue
    this.#options = options
    getBefore(this.#key, defaultValue)
      .then((value: T) => { this.#value = value })
  }

  get value() {
    return this.#value
  }
  set value(v) {
    this.#value = v
    writeValue(this.#key, this.#value)
  }
  resetValue = () => {
    this.#value = this.#defaultValue
    writeValue(this.#key, this.#defaultValue)
  }
  toggle = () => {
    if (this.#options.length === 2) {
      this.#value = this.#value === this.#options[0] ? this.#options[1] : this.#options[0];
      writeValue(this.#key, this.#value)
    } else throw new Error("More or less than 2 options were passed")
  }
  cycle = () => {
    if (this.#options.length > 1) {
      const currentIndex = this.#options.indexOf(this.#value);
      const next = (currentIndex + 1) % this.#options.length;
      this.#value = this.#options[next];
      writeValue(this.#key, this.#value)
    } else throw new Error("Less than 2 options were passed")
  }
}

export const themeMode = new StoredState<"dark" | "light">("theme_mode", "dark", ["light", "dark"])
export const retroMode = new StoredState<boolean>("retro_mode", false, [true, false])

// export const retroMode = new (class {
//   active = $state(false);
//   async save(v: boolean) {
//     const store = await load("settings.json");
//     store.set("retro_mode", v);
//   }
// })();

// export const showOnlyNew = writable<boolean>(false);
// export const closeTray = writable<boolean>(false);
// export const libraryFavorites = writable<Favorite[]>([]);
// export const downloadPath = writable<string>("Mangas/");
// export const customTitlebar = writable<boolean>(true);
// export const openFavoriteChapter = writable<boolean>(false)
// export const isChaptersUniqueNumber = writable<boolean>(false);
// export const isChaptersDescending = writable<boolean>(true);
// export const chapterPagesCounter = writable<boolean>(true);
// export const chapterPercentage = writable<boolean>(true);
// export const chaptersCache = writable<(ReadCache & { chapters: Chapter[]; images: string[] })[]>([]);
// export const readerClock = writable<boolean>(false);
// export const showCurrentChapter = writable<boolean>(false);
// export const selectedSource = writable<string>(MANGASOURCES[2].name);
// export const isAscending = writable<boolean>(true);
