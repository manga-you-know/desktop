import { writable, readable } from "svelte/store";
import { DownloadManager } from "@/managers";
import type { Readed } from "@/models";
import { MANGASOURCES } from "@/constants";
import type { Favorite, Chapter, Language } from "@/interfaces";

export const downloadManager = readable<DownloadManager>(new DownloadManager());
export const libraryFavorites = writable<Favorite[]>([]);
export const ultraFavorites = writable<Favorite[]>([]);
export const searchTerm = writable<string>("");
export const globalChapters = writable<Chapter[]>([]);
export const readeds = writable<Readed[]>([]);
export const openSearch = writable<boolean>(false);
export const openSettings = writable<boolean>(false);
export const selectedSource = writable<string>(MANGASOURCES[2].name);
export const orderBy = writable<string>("id");
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
