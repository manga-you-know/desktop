import type { Source } from "@/types";

// export const MANGASOURCES: Source[] = [
//   "MangaSee",
//   "MangaDex",
//   "MangaFire",
//   "MangaReaderTo",
//   "TCB",
//   // "MangaPill",
//   "Taosect",
// ];

export const MANGASOURCES: Source[] = [
  { name: "MangaDex", language: "Multi" },
  { name: "MangaFire", language: "Multi", isRecommended: true },
  { name: "WeebCentral", language: "English", isRecommended: true },
  { name: "MangaLivre", language: "Portuguese" },
  { name: "TCB", language: "English", isRecommended: true },
  { name: "MangaReaderTo", language: "English", isProblem: true },
  // { name: "MangaPill", language: "English", isProblem: true },
  { name: "Taosect", language: "Portuguese" },
];

export const COMICSOURCES: Source[] = [
  { name: "BatcaveBiz", language: "English" },
];

export const READSOURCES_LANGUAGE: { [key: string]: string } = {
  MangaDex: "Multi",
  MangaFire: "Multi",
  MangaSee: "English",
  TCB: "English",
  MangaReaderTo: "English",
  // MangaPill: "English",
  Taosect: "Português",
  MangaLivre: "Português",
  WeebCentral: "English",
  BatcaveBiz: "English",
};

export const ANIMESOURCES: Source[] = [
  { name: "Aniplay", language: "Multi", isProblem: true },
  { name: "AnimeOwl", language: "English" },
];
