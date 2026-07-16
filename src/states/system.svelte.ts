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
import type { MangaFetch, SourceBrowse } from "@/types/server";
import { getBasePath, slugify } from "@/lib/utils";
import type { Manga, Source as SourceDB } from "@/lib/types/db";
import { chapters, db, mangas, sources } from "@/lib/db";
import { eq } from "drizzle-orm";
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
export const searchPage = new ValueState<number>({ value: 1 });

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

class Animate {
  val = $state<Record<string, boolean>>({});
}

export const shouldAnimate = new Animate();

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

class DBHelper {
  rawMangas = $state<Manga[]>([]);
  libraryMangas = $state<Manga[]>([]);
  rawSources = $state<SourceDB[]>([]);
  mangasBy = $derived(
    Object.fromEntries(this.rawMangas.map((m) => [[m.type], m])),
  );
  sourcesByIdMangaSource = $derived(
    Object.fromEntries(
      this.rawSources.map((s) => [s.mangaSourceId + s.sourceId, s]),
    ),
  );

  async refreshMangas() {
    this.rawMangas = await db.select().from(mangas).all();
  }

  async refreshSources() {
    this.rawSources = await db.select().from(sources).all();
  }

  async addSource(
    mangaFetch: MangaFetch,
    suwaSource: Source,
    mangaId?: number,
  ) {
    // adds a source, if there is a mangaId, it adds to that manga
    // if not, it creates a manga with the given info
    if (mangaId === undefined) {
      const manga = await db
        .insert(mangas)
        .values({
          name: mangaFetch.title,
          slugName: slugify(mangaFetch.title),
          currentCover: mangaFetch.thumbnailUrl ?? "",
          covers: mangaFetch.thumbnailUrl ? [mangaFetch.thumbnailUrl] : [],
          description: mangaFetch.description,
          author: mangaFetch.author,
          artist: mangaFetch.artist,
          genre: mangaFetch.genre,
        })
        .returning();
      if (manga.length === 0) return;
      mangaId = manga[0].id;
    }
    const source = await db
      .insert(sources)
      .values({
        name: mangaFetch.title,
        mangaId: mangaId,
        sourceId: suwaSource.id,
        sourceName: suwaSource.name,
        mangaSourceId: mangaFetch.id.toString(),
        extensionId: suwaSource.extension.pkgName,
        language: suwaSource.lang,
        coverUrl: mangaFetch.thumbnailUrl ?? "",
        coverUrlLastFetched: new Date(
          mangaFetch.thumbnailUrlLastFetched * 1000,
        ),
        iconUrl: suwaSource.iconUrl,
        realUrl: mangaFetch.realUrl ?? "",
      })
      .returning();
    this.refreshMangas();
    this.refreshSources();
    return source;
  }
  async deleteSource(source: SourceDB) {
    await db.delete(sources).where(eq(sources.id, source.id));
    const mangaSources = await db
      .select()
      .from(sources)
      .where(eq(sources.mangaId, source.mangaId));
    if (mangaSources.length === 0) {
      await db.delete(mangas).where(eq(mangas.id, source.mangaId));
    }

    this.refreshMangas();
    this.refreshSources();
  }

  constructor() {
    this.refreshMangas();
    this.refreshSources();
  }
}

export const dbHelper = new DBHelper();

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
