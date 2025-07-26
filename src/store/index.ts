import { writable, readable, get } from "svelte/store";
import { DownloadManager } from "@/managers";
import { IS_MOBILE, MANGASOURCES } from "@/constants";
import type {
  Mark,
  Panel,
  Readed,
  Chapter,
  Favorite,
  Language,
  UpdateInfo,
  Downloading,
  FavoriteLoaded,
} from "@/types";

export const downloadManager = writable<DownloadManager>(new DownloadManager());
export const favoritesLoaded = writable<Record<string, FavoriteLoaded>>({});
export const undoTasks = writable<
  { do: (() => void) | (() => Promise<void>); message: string }[]
>([]);
export const coversLoaded = writable<Record<string, string>>({});
export const showOnlyNew = writable<boolean>(false);
export const closeTray = writable<boolean>(false);
export const libraryFavorites = writable<Favorite[]>([]);
export const ultraFavorites = writable<Favorite[]>([]);
export const libraryQuery = writable<string>("");
export const librarySource = writable<string>("");
export const libraryTag = writable<Mark | undefined>(undefined);
export const libraryOrder = writable<string>("id");
export const globalChapters = writable<Chapter[]>([]);
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
export const openAdd = writable<boolean>(false);
export const openTag = writable<boolean>(false);
export const customTitlebar = writable<boolean>(true);
export const isRefreshing = writable<boolean>(false);
export const isChaptersDescending = writable<boolean>(true);
export const chapterPagesCounter = writable<boolean>(true);
export const chapterPercentage = writable<boolean>(true);
export const readerClock = writable<boolean>(false);
export const showCurrentChapter = writable<boolean>(false);
export const selectedSource = writable<string>(MANGASOURCES[1].name);
export const isAscending = writable<boolean>(true);
export const downloadings = writable<Downloading[]>([]);
export const searchTerm = writable<string>("");
export const extraTitle = writable<string>("");
export const sidebarBehavior = writable<"on-hover" | "expand" | "collapse">(
  "collapse"
);
export const autoSearchUpdates = writable<boolean>(true);
export const notifyUpdate = writable<boolean>(true);
export const notifyFavorites = writable<boolean>(true);
export const customNotificator = writable<boolean>(false);
export const showCountIcon = writable<boolean>(true);
export const showCountIconTray = writable<boolean>(false);
export const blurEffects = writable<boolean>(true);
export const windowEffects = writable<boolean>(false);
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
