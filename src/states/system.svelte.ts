import { DownloadManager } from "@/managers";
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
} from "@/types";
import { suwaManager } from "@/lib/helpers";
import { delay } from "@/utils";
import {
  activeExtensionRepos,
  blockedExtensions,
  showExtensionsNsfw,
} from "./stored.svelte";
// import { favorites } from "@/lib/db";

class OpenState {
  #active = $state(false);
  onchange: (value: boolean) => void;

  constructor(onchange = (_open: boolean) => { }) {
    this.onchange = onchange;
  }

  get active() {
    return this.#active;
  }

  set active(open) {
    this.#active = open;
    this.onchange(open);
  }

  open = () => {
    this.#active = true;
    this.onchange(true);
  };

  close = () => {
    this.#active = false;
    this.onchange(false);
  };
}

class OpenedObject<T> {
  #value: T | null = $state(null);
  onchange: (_: T | null) => void;

  constructor(config?: { onchange?: (_: T | null) => void }) {
    this.onchange = config?.onchange ?? (() => { });
  }

  get value(): T | null {
    return this.#value;
  }

  set value(v: T | null) {
    this.#value = v;
    this.onchange?.(v);
  }

  set(v: T | null) {
    this.#value = v;
    this.onchange?.(v);
  }
}

export const openAdd = new OpenState();
export const openSettings = new OpenState();
export const openExtensions = new OpenState();

export const openedExtension = new OpenedObject<Extension>();

export const openTag = new (class {
  active = $state(false);
})();
export const openInfo = new (class {
  active = $state(false);
})();
export const openUpdate = new (class {
  active = $state(false);
})();
export const openSearch = new (class {
  active = $state(false);
})();
export const openFeedback = new (class {
  active = $state(false);
})();
export const openReadModal = new (class {
  active = $state(false);
})();
export const openReaderMenu = new (class {
  active = $state(false);
})();
export const openPatchNotes = new (class {
  active = $state(false);
})();
export const openReaderDrawer = new (class {
  active = $state(false);
})();

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

type Extension = {
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
  isBlocked?: boolean;
};

class Suwayomi {
  isConnected: boolean = $state(false);
  extensionRepos: string[] = $state([]);
  rawExtensions: Extension[] = $state([]);
  extensions: Extension[] = $derived(
    this.rawExtensions.filter(
      (e) =>
        !blockedExtensions.value[e.pkgName] &&
        (showExtensionsNsfw.value ? true : !e.isNsfw) &&
        activeExtensionRepos.value.includes(e.repo),
    ),
  );
  installedExtensions: Extension[] = $derived(
    this.rawExtensions.filter(
      (e) => e.isInstalled && !blockedExtensions.value[e.pkgName],
    ),
  );
  nonInstalledExtensions: Extension[] = $derived(
    this.extensions.filter((e) => !e.isInstalled),
  );
  blockedExtensions: Extension[] = $derived(
    this.rawExtensions.filter((e) => blockedExtensions.value[e.pkgName]),
  );
  availableLangs: string[] = $derived(
    Array.from(new Set(this.extensions.map((e) => e.lang))),
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
// export const isRefreshing = writable<boolean>(false);
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
// export const blockKeyboard = writable<boolean>(false);
// export const openDownloads = writable<boolean>(false);
