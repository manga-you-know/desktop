
import { DownloadManager } from "@/managers";
import { ANIMESOURCES, COMICSOURCES, IS_MOBILE, MANGASOURCES } from "@/constants";
import {
  type Mark,
  type Panel,
  type Readed,
  type Chapter,
  type Favorite,
  type Language,
  type UpdateInfo,
  type Downloading,
  type FavoriteLoaded,
  type ReadCache,
} from "@/types";
import { favorites } from "@/db";

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


export const favoritesLoaded = writable<Record<string, FavoriteLoaded>>({});
export const undoTasks = writable<
  { do: (() => void) | (() => Promise<void>); message: string }[]
>([]);
export const coversLoaded = writable<Record<string, string>>({});
export const showOnlyNew = writable<boolean>(false);
export const closeTray = writable<boolean>(false);
export const rawFavorites = writable<Favorite[]>([]);
export const libraryFavorites = writable<Favorite[]>([]);
export const ultraFavorites = writable<typeof favorites.$inferSelect[]>([]);
export const libraryQuery = writable<string>("");
export const librarySource = writable<string>("");
export const libraryTag = writable<Mark | undefined>(undefined);
export const libraryOrder = writable<string>("id");
export const globalChapters = writable<Chapter[]>([]);
export const selectedScan = writable<string>("");
export const downloadPath = writable<string>("Mangas/");
export const readeds = writable<Readed[]>([]);
export const tags = writable<Mark[]>([]);
export const panels = writable<Panel[]>([]);
export const updateInfo = writable<UpdateInfo>({
  updateAvailable: false,
  version: "",
  changelog: "",
  url: "",
  fetchUpdate: () => Promise.resolve(),
});
export const openDownloads = writable<boolean>(false);
export const customTitlebar = writable<boolean>(true);
export const openFavoriteChapter = writable<boolean>(false)
export const isRefreshing = writable<boolean>(false);
export const isChaptersUniqueNumber = writable<boolean>(false);
export const isChaptersDescending = writable<boolean>(true);
export const chapterPagesCounter = writable<boolean>(true);
export const chapterPercentage = writable<boolean>(true);
export const chaptersCache = writable<(ReadCache & { chapters: Chapter[]; images: string[] })[]>([]);
export const readerClock = writable<boolean>(false);
export const showCurrentChapter = writable<boolean>(false);
export const selectedSource = writable<string>(MANGASOURCES[2].name);
export const isAscending = writable<boolean>(true);
export const downloadings = writable<Downloading[]>([]);
export const searchTerm = writable<string>("");
export const extraTitle = writable<string>("");
export const blockKeyboard = writable<boolean>(false);
