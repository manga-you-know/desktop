import { writable, readable, get } from "svelte/store";
import { DownloadManager } from "@/managers";
import { Favorite, type Chapter, type Readed } from "@/models";

export const downloadManager = readable<DownloadManager>(new DownloadManager());
export const libraryFavorites = writable<Favorite[]>([]);
export const searchTerm = writable<string>("");
export const chapters = writable<Chapter[]>([]);
export const readeds = writable<Readed[]>([]);
