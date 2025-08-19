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
  { name: "MangaFire", language: "Multi", isRecommended: true },
  { name: "MangaDex", language: "Multi" },
  { name: "WeebCentral", language: "English", isRecommended: true },
  { name: "MangaLivre", language: "Português" },
  { name: "TCB", language: "English", isRecommended: true },
  { name: "MangaReaderTo", language: "English", isProblem: true },
  // { name: "MangaPill", language: "English", isProblem: true },
  { name: "Taosect", language: "Português" },
  // { name: "MangaSwat", language: "العربية", }
];

export const COMICSOURCES: Source[] = [
  { name: "BatcaveBiz", language: "English" },
];

export const READSOURCES_LANGUAGE: { [key: string]: string } = {
  MangaFire: "Multi",
  MangaDex: "Multi",
  MangaSee: "English",
  TCB: "English",
  MangaReaderTo: "English",
  // MangaPill: "English",
  Taosect: "Português",
  MangaLivre: "Português",
  WeebCentral: "English",
  BatcaveBiz: "English",
  MangaSwat: "العربية",
};

export const ANIMESOURCES: Source[] = [
  { name: "Aniplay", language: "Multi", isProblem: true },
  { name: "AnimeOwl", language: "English" },
];
