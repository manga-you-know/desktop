import { writable, readable, get } from "svelte/store";
import { DownloadManager } from "@/managers";
import { IS_MOBILE, MANGASOURCES } from "@/constants";
import type {
  Mark,
  Readed,
  Chapter,
  Favorite,
  Language,
  UpdateInfo,
  Downloading,
  FavoriteLoaded,
} from "@/types";

export const downloadManager = writable<DownloadManager>(new DownloadManager());
export const favoritesLoaded = writable<{ [key: string]: FavoriteLoaded }>({});
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
export const panels = writable<
  { src: string; path: string; shouldCopy?: boolean }[]
>([]);
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
export const openSettings = writable<boolean>(false);
export const openDownloads = writable<boolean>(false);
export const openAdd = writable<boolean>(false);
export const openTag = writable<boolean>(false);
export const isRefreshing = writable<boolean>(false);
export const isChaptersDescending = writable<boolean>(true);
export const selectedSource = writable<string>(MANGASOURCES[2].name);
export const isAscending = writable<boolean>(true);
export const downloadings = writable<Downloading[]>([]);
export const sidebarBehavior = writable<"on-hover" | "expand" | "collapse">(
  "on-hover"
);
export const autoSearchUpdates = writable<boolean>(true);
export const notifyUpdate = writable<boolean>(true);
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
export const fitMode = writable<"" | "width">(IS_MOBILE ? "" : "width");
export const viewMode = writable<"single" | "scroll">("single");
export const zoomLevel = writable<number>(100);
