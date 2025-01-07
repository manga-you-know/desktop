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
  { name: "MangaDex", language: "Multi" },
  { name: "MangaFire", language: "Multi" },
  { name: "MangaSee", language: "English" },
  { name: "TCB", language: "English" },
  { name: "MangaReaderTo", language: "English" },
  // { name: "MangaPill", language: "English" },
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
};
