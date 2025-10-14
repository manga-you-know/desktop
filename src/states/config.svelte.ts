export const themeMode = new class {
  #value: "light" | "dark" = $state("dark")
  get value() {
    return this.#value
  }
  set value(t) {
    this.#value = t
  }
}

export const system24 = new class {
  #active = $state(false)
  get active() {
    return this.#active
  }
  set active(v) {
    this.#active = v
  }
  toggle() {
    this.#active = !this.#active
  }
}

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
