import type { MSource } from "@/types/source";

// export const MANGASOURCES: Source[] = [
//   "MangaSee",
//   "MangaDex",
//   "MangaFire",
//   "MangaReaderTo",
//   "TCB",
//   // "MangaPill",
//   "Taosect",
// ];

export const MANGASOURCES: MSource[] = [
  {
    id: "MangaDex",
    name: "MangaDex",
    language: "multi",
    languageLabel: "Multi",
    iconPath: "source_icons/mangadex.png",
  },
  {
    id: "Atsumaru",
    name: "Atsumaru",
    language: "en",
    languageLabel: "English",
    iconPath: "source_icons/atsumaru.png",
  },
  {
    id: "WeebCentral",
    name: "WeebCentral",
    language: "en",
    languageLabel: "English",
    iconPath: "source_icons/weebcentral.png",
  },
  {
    id: "TCB",
    name: "TCB Scans",
    language: "en",
    languageLabel: "English",
    iconPath: "source_icons/tcb_scans.png",
  },
  {
    id: "Taosect",
    name: "Tao Sect",
    language: "pt-br",
    languageLabel: "Português (Brasil)",
    iconPath: "source_icons/taosect.png",
  },
  // { name: "MangaLivre", language: "Português" },
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
  Taosect: "Português (Brasil)",
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
