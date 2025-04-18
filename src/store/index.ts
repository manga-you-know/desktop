import { writable, readable } from "svelte/store";
import { type } from "@tauri-apps/plugin-os";
import { DownloadManager } from "@/managers";
import { MANGASOURCES } from "@/constants";
import type {
  Favorite,
  Chapter,
  Readed,
  FavoriteLoaded,
  Language,
  UpdateInfo,
} from "@/interfaces";
import type { Mark } from "@/types";
const os = type();

export const downloadManager = writable<DownloadManager>(new DownloadManager());
export const isMobile = writable<boolean>(os === "android" || os === "ios");
export const favoritesLoaded = writable<{ [key: string]: FavoriteLoaded }>({});
export const showOnlyNew = writable<boolean>(false);
export const closeTray = writable<boolean>(false);
export const libraryFavorites = writable<Favorite[]>([]);
export const ultraFavorites = writable<Favorite[]>([]);
export const libraryQuery = writable<string>("");
export const librarySource = writable<string>("");
export const libraryCollection = writable<string>("");
export const libraryOrder = writable<string>("id");
export const globalChapters = writable<Chapter[]>([]);
export const readeds = writable<Readed[]>([]);
export const collections = writable<Mark[]>([]);
export const panels = writable<{ src: string; path: string }[]>([]);
export const updateInfo = writable<UpdateInfo>({
  updateAvailable: false,
  version: "",
  changelog: "",
  url: "",
  fetchUpdate: () => Promise.resolve(),
});
export const openUpdate = writable<boolean>(false);
export const openMenuChapters = writable<boolean>(false);
export const openSearch = writable<boolean>(false);
export const openSettings = writable<boolean>(false);
export const openAdd = writable<boolean>(false);
export const openCollection = writable<boolean>(false);
export const selectedSource = writable<string>(MANGASOURCES[2].name);
export const isAscending = writable<boolean>(true);
export const autoSearchUpdates = writable<boolean>(true);
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
export const fitMode = writable<string>("");
export const viewMode = writable<string>("single");
export const zoomLevel = writable<number>(100);
