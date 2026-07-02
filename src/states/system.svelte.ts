import {
  ANIMESOURCES,
  COMICSOURCES,
  IS_MOBILE,
  MANGASOURCES,
} from "@/constants";
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
  Extension,
  Source,
} from "@/types";
import { suwaManager } from "@/lib/helpers";
import { delay } from "@/utils";
import {
  activeExtensionRepos,
  enabledSources,
  hiddenExtensions,
  hiddenSources,
} from "./stored.svelte";
import {
  OpenedObject,
  OpenState,
  TextState,
  ValueState,
} from "./classes.svelte";
import type { SourceBrowse } from "@/types/server";
import { getBasePath } from "@/lib/utils";
// import { favorites } from "@/lib/db";

export const openAdd = new OpenState();
export const openSettings = new OpenState();
export const openExtensions = new OpenState();
export const openUpdate = new OpenState();
export const openMenuChapters = new OpenState();
export const openReaderMenu = new OpenState({ value: true });
export const openReaderDrawer = new OpenState();
export const openSavedModal = new OpenState();
export const openSearch = new OpenState();
export const openInfo = new OpenState();
export const openDownloads = new OpenState();
export const openPatchNotes = new OpenState();
export const openFeedback = new OpenState();
export const openTag = new OpenState();
export const blockKeyboard = new OpenState();

export const searchInput = new TextState({ value: "" });

export const openedExtension = new OpenedObject<{
  extension?: Extension;
  source?: Source;
}>({ value: {} });
export const openedSearchFilters = new OpenedObject<{
  sourceBrowse?: SourceBrowse;
}>({ value: {} });

export const rawSaveds = new (class {
  value: Favorite[] = $state([]);
  refresh() {
    this.value = []; // refresh logic
  }
})();
export const librarySaveds = new (class {
  value: Favorite[] = $state([]);
  refresh() {
    this.value = [];
  }
})();
export const favoriteSaveds = new (class {
  value: Favorite[] = $state([]);
  refresh() {
    this.value = [];
  }
})();
export const readeds = new (class {
  value: Readed[] = $state([]);
  refresh() {
    this.value = [];
  }
})();
export const tags = new (class {
  value: Mark[] = $state([]);
  refresh() {
    this.value = [];
  }
})();
export const panels = new (class {
  value: Panel[] = $state([]);
  async refresh() {
    this.value = [];
  }
})();

class Suwayomi {
  isConnected: boolean = $state(false);
  extensionRepos: string[] = $state([]);
  rawExtensions: Extension[] = $state([]);
  extensions: Extension[] = $derived(
    this.rawExtensions.filter(
      (e) =>
        !hiddenExtensions.value[e.pkgName] &&
        activeExtensionRepos.value.includes(getBasePath(e.repo)),
    ),
  );
  installedExtensions: Extension[] = $derived(
    this.rawExtensions.filter(
      (e) => e.isInstalled && !hiddenExtensions.value[e.pkgName],
    ),
  );
  nonInstalledExtensions: Extension[] = $derived(
    this.extensions.filter((e) => !e.isInstalled),
  );
  hiddenExtensions: Extension[] = $derived(
    this.rawExtensions.filter((e) => hiddenExtensions.value[e.pkgName]),
  );
  availableExtensionLangs: string[] = $derived(
    Array.from(new Set(this.extensions.map((e) => e.lang))),
  );
  extensionsByPkgName: Record<string, Extension> = $derived(
    Object.fromEntries(this.rawExtensions.map((e) => [e.pkgName, e])),
  );
  rawSources: Source[] = $state([]);
  sources: Source[] = $derived(
    this.rawSources.filter(
      (s) =>
        !hiddenSources.value[s.id.toString()] &&
        activeExtensionRepos.value.includes(
          getBasePath(s.extension.repo ?? "https://google.com"),
        ),
    ),
  );
  enabledSources: Source[] = $derived(
    this.rawSources.filter(
      (s) =>
        enabledSources.value[s.id.toString()] &&
        !hiddenSources.value[s.id.toString()],
    ),
  );
  disabledSources: Source[] = $derived(
    this.sources.filter((s) => !enabledSources.value[s.id.toString()]),
  );
  hiddenSources: Source[] = $derived(
    this.rawSources.filter((s) => hiddenSources.value[s.id.toString()]),
  );
  sourcesById: Record<string, Source> = $derived(
    Object.fromEntries(this.rawSources.map((s) => [s.id, s])),
  );
  availableSourceLangs: string[] = $derived(
    Array.from(new Set(this.sources.map((s) => s.lang))),
  );
  constructor() {
    this.#checkConnection();
  }

  async #checkConnection() {
    while (true) {
      this.isConnected = await suwaManager.isConnected();
      await delay(5000);
    }
  }
}

export const suwayomi = new Suwayomi();

// export const selectedScan = writable<string>("");
// export const libraryTag = writable<Mark | undefined>(undefined);
// export const libraryOrder = writable<string>("id");
// export const isRefreshing = new OpenState();
// export const extraTitle = writable<string>("");
// export const libraryQuery = writable<string>("");
// export const librarySource = writable<string>("");
// export const globalChapters = writable<Chapter[]>([]);
// export const favoritesLoaded = writable<Record<string, FavoriteLoaded>>({});
// export const undoTasks = writable<
//   { do: (() => void) | (() => Promise<void>); message: string }[]
// >([]);
//
// export const downloadings = writable<Downloading[]>([]);
// export const coversLoaded = writable<Record<string, string>>({});
// export const updateInfo = writable<UpdateInfo>({
//   updateAvailable: false,
//   version: "",
//   changelog: "",
//   url: "",
//   fetchUpdate: () => Promise.resolve(),
// });
