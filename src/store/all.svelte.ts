import { writable, readable, get } from "svelte/store";
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
import { downloader } from "@/services/downloader";

// export const downloadManager = writable<DownloadManager>(new DownloadManager());
export const downloadManager = writable(new DownloadManager())
export const favoritesLoaded = writable<Record<string, FavoriteLoaded>>({});
export const undoTasks = writable<
  { do: (() => void) | (() => Promise<void>); message: string }[]
>([]);
export const coversLoaded = writable<Record<string, string>>({});
export let vei = $state("wow")
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
export const openUpdate = writable<boolean>(false);
export const openMenuChapters = writable<boolean>(false);
export const openReadMenu = writable<boolean>(true);
export const openSearch = writable<boolean>(false);
export const openInfo = writable<boolean>(false);
export const openSettings = writable<boolean>(false);
export const openDownloads = writable<boolean>(false);
export const openPatchNotes = writable<boolean>(false);
export const openFeedback = writable<boolean>(false);
export const openAdd = writable<boolean>(false);
export const openTag = writable<boolean>(false);
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
export const sidebarBehavior = writable<"on-hover" | "expand" | "collapse">(
  "collapse"
);
export const sidebarSide = writable<"left" | "right">("left")
export const activatedSources = writable<string[]>([...MANGASOURCES.map(s => s.name), ...COMICSOURCES.map(s => s.name), ...ANIMESOURCES.map(s => s.name)])
export const autoSearchUpdates = writable<boolean>(true);
export const notifyUpdate = writable<boolean>(true);
export const notifyFavorites = writable<boolean>(true);
export const customNotificator = writable<boolean>(false);
export const showCountIcon = writable<boolean>(true);
export const showCountIconTray = writable<boolean>(false);
export const blackWhiteMode = writable<boolean>(false);
export const contrast = writable<number>(1);
export const saturation = writable<number>(1);
export const sepia = writable<number>(0);
export const brightness = writable<number>(1);
export const useFilter = writable<boolean>(false);
export const filterReader = writable<boolean>(false);
export const filter = writable<string>("bg-amber-500/20");
export const blurEffects = writable<boolean>(true);
export const windowEffects = writable<boolean>(false);
export const keepReading = writable<boolean>(true);
export const markReaded = writable<"start" | "end" | "manual">("start");
export const discordIntegration = writable<boolean>(false);
export const preferableLanguage = writable<Language>({
  id: "en",
  label: "English",
});
export const autoEnterFullscreen = writable<boolean>(true);
export const lastPage = writable<string>("/home");
export const theme = writable<"dark" | "light" | undefined>("dark");
export const appLanguage = writable<string>("en");
export const useMpv = writable<boolean>(false);
export const isFullscreen = writable<boolean>(false);
export const isMaximized = writable<boolean>(false);
export const fitMode = writable<"" | "width">(IS_MOBILE ? "" : "width");
export const viewMode = writable<"single" | "scroll">("single");
export const zoomLevel = writable<number>(100);
