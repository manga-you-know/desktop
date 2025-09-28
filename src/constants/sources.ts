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
  // { name: "Comick", language: "Multi", isRecommended: true },
  { name: "MangaDex", language: "Multi" },
  { name: "MangaFire", language: "Multi" },
  { name: "Atsumaru", language: "English", isRecommended: true },
  { name: "WeebCentral", language: "English", isProblem: true },
  { name: "MangaPark", language: "English" },
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
  Comick: "Multi",
  TCB: "English",
  MangaReaderTo: "English",
  // MangaPill: "English",
  Taosect: "Português",
  MangaLivre: "Português",
  WeebCentral: "English",
  BatcaveBiz: "English",
  MangaSwat: "العربية",
  MangaPark: "English",
  Atsumaru: "English",
};

export const ANIMESOURCES: Source[] = [
  { name: "Aniplay", language: "Multi", isProblem: true },
  { name: "AnimeOwl", language: "English" },
];
