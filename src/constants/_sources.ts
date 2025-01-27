import type { Source } from "@/interfaces";

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
  { name: "MangaDex", language: "Multi", isRecommended: true },
  { name: "MangaFire", language: "Multi", isProblem: true },
  { name: "WeebCentral", language: "English", isRecommended: true },
  { name: "TCB", language: "English", isRecommended: true },
  { name: "MangaSee", language: "English", isProblem: true },
  { name: "MangaReaderTo", language: "English", isProblem: true },
  // { name: "MangaPill", language: "English", isProblem: true },
  { name: "Taosect", language: "Portuguese" },
];

export const MANGASOURCE_LANGUAGE: { [key: string]: string } = {
  MangaDex: "Multi",
  MangaFire: "Multi",
  MangaSee: "English",
  TCB: "English",
  MangaReaderTo: "English",
  // MangaPill: "English",
  Taosect: "Português",
  WeebCentral: "English",
};

export const ANIMESOURCES: Source[] = [{ name: "Aniplay", language: "Multi" }];
