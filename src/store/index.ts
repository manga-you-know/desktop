import { writable, readable } from "svelte/store";
import { DownloadManager } from "@/managers";
import { MANGASOURCES } from "@/constants";
import type {
  Favorite,
  Chapter,
  Readed,
  FavoriteLoaded,
  Language,
} from "@/interfaces";

export const downloadManager = readable<DownloadManager>(new DownloadManager());
export const favoritesLoaded = writable<{ [key: string]: FavoriteLoaded }>({});
export const libraryFavorites = writable<Favorite[]>([]);
export const ultraFavorites = writable<Favorite[]>([]);
export const libraryQuery = writable<string>("");
export const librarySource = writable<string>("");
export const libraryOrder = writable<string>("id");
export const globalChapters = writable<Chapter[]>([]);
export const readeds = writable<Readed[]>([]);
export const openSearch = writable<boolean>(false);
export const openSettings = writable<boolean>(false);
export const selectedSource = writable<string>(MANGASOURCES[2].name);
export const isAscending = writable<boolean>(true);
export const autoSearchUpdates = writable<boolean>(true);
export const preferableLanguage = writable<Language>({
  id: "en",
  label: "English",
});
export const autoEnterFullscreen = writable<boolean>(true);
export const defaultPage = writable<string>("home");
export const theme = writable<string>("dark");
export const appLanguage = writable<string>("en");
export const useMpv = writable<boolean>(false);
export const isFullscreen = writable<boolean>(false);
