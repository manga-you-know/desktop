import { writable, readable, get } from "svelte/store";
import { DownloadManager } from "@/managers";
import type { Favorite, Chapter, Readed } from "@/models";

const downloadManager = readable<DownloadManager>(new DownloadManager());
export const dlManager = () => get(downloadManager);
export const favorites = writable<Favorite[]>([]);
export const chapters = writable<Chapter[]>([]);
export const readeds = writable<Readed[]>([]);
