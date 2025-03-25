import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl, Favorite, Chapter, Language } from "@/interfaces";
import { LANGUAGE_LABELS } from "@/constants";

export class MangaLivreDl implements MangaDl {
	baseUrl: string = "https://mangalivre.ru";
	isMultiLanguage: boolean = false;
	search(query: string): Promise<Favorite[]> {
		throw new Error("Method not implemented.");
	}
	getChapters(favoriteID: string, language?: string): Promise<Chapter[]> {
		throw new Error("Method not implemented.");
	}
	getChapterImages(chapterID: string): Promise<string[]> {
		throw new Error("Method not implemented.");
	}
	getMangaByUrl(url: string): Promise<Favorite> {
		throw new Error("Method not implemented.");
	}
	getMangaById(id: string): Promise<Favorite> {
		throw new Error("Method not implemented.");
	}

}