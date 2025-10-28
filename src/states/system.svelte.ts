
import { DownloadManager } from "@/managers";
import { ANIMESOURCES, COMICSOURCES, IS_MOBILE, MANGASOURCES } from "@/constants";
import type {
  Mark,
  Panel,
  Readed,
  Favorite,
  Chapter,
  Language,
  ReadCache,
  UpdateInfo,
  Downloading,
  FavoriteLoaded,
} from "@/types";
// import { favorites } from "@/db";

export const openAdd = new class { active = $state(false) }
export const openTag = new class { active = $state(false) }
export const openInfo = new class { active = $state(false) }
export const openUpdate = new class { active = $state(false) }
export const openSearch = new class { active = $state(false) }
export const openSettings = new class { active = $state(false) }
export const openFeedback = new class { active = $state(false) }
export const openReadModal = new class { active = $state(false) }
export const openReaderMenu = new class { active = $state(false) }
export const openPatchNotes = new class { active = $state(false) }
export const openReaderDrawer = new class { active = $state(false) }

export const texts = new class {
  language: "en" | "pt-br" = $state("en")

  finalTexts: Record<string, { title: string, welcome: string }> = {
    en: {
      title: "faggs",
      welcome: "Hello my friend called ? !!!"
    },
    "pt-br": {
      title: "viados",
      welcome: "Fala viadoooo ? !!!"
    }
  }

  text = $derived(this.finalTexts[this.language])
  title = $derived(this.text.title)
}




export const rawSaveds = new class {
  value: Favorite[] = $state([])
  refresh() {
    this.value = [] // refresh logic
  }
}
export const librarySaveds = new class {
  value: Favorite[] = $state([])
  refresh() {
    this.value = []
  }
}
export const favoriteSaveds = new class {
  value: Favorite[] = $state([])
  refresh() {
    this.value = []
  }
}
export const readeds = new class {
  value: Readed[] = $state([])
  refresh() {
    this.value = []
  }
}
export const tags = new class {
  value: Mark[] = $state([])
  refresh() {
    this.value = []
  }
}
export const panels = new class {
  value: Panel[] = $state([])
  async refresh() {
    this.value = []
  }
}

// export const selectedScan = writable<string>("");
// export const libraryTag = writable<Mark | undefined>(undefined);
// export const libraryOrder = writable<string>("id");
// export const isRefreshing = writable<boolean>(false);
// export const extraTitle = writable<string>("");
// export const libraryQuery = writable<string>("");
// export const librarySource = writable<string>("");
// export const globalChapters = writable<Chapter[]>([]);
// export const favoritesLoaded = writable<Record<string, FavoriteLoaded>>({});
// export const undoTasks = writable<
//   { do: (() => void) | (() => Promise<void>); message: string }[]
// >([]);
// export const downloadings = writable<Downloading[]>([]);
// export const coversLoaded = writable<Record<string, string>>({});
// export const updateInfo = writable<UpdateInfo>({
//   updateAvailable: false,
//   version: "",
//   changelog: "",
//   url: "",
//   fetchUpdate: () => Promise.resolve(),
// });
// export const blockKeyboard = writable<boolean>(false);
// export const openDownloads = writable<boolean>(false);
