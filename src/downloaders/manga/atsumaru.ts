import { fetch } from "@tauri-apps/plugin-http";
import { load } from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter } from "@/types";
import { getSlug } from "@/utils";

export class AtsumaruDl implements MangaDl {
  baseUrl = "https://atsu.moe"
  isMultiLanguage = false;
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    // 'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Referer': 'https://atsu.moe',
    'Sec-GPC': '1',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Connection': 'keep-alive',
    'Priority': 'u=4',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'TE': 'trailers'
  }

  getMangaByUrl(url: string): Promise<Favorite> {
    throw new Error("not implemented")
  }

  getMangaById(id: string): Promise<Favorite> {
    // malId, anilistId, mangaBakaId, mangaUpdatesId
    throw new Error("not implemented")
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/collections/manga/documents/search?q=${query}&limit=24&query_by=title,englishTitle,otherNames,authors&query_by_weights=4,3,2,1&include_fields=id,title,englishTitle,poster,authors,synopsis,status,tags&num_typos=4,3,2,1`)
    if (response.status !== 200) {
      throw new Error(`Search failed with query: ${query} and status: ${response.status}`)
    }
    const responseJson: {
      hits: { document: { id: string, title: string, poster: string, englishTitle: string, synopsis: string, authors: string[] } }[]
    } = await response.json()
    const results: Favorite[] = [];
    responseJson.hits.forEach((item) => {
      results.push({
        id: -1,
        name: item.document.title,
        folder_name: getSlug(item.document.title),
        cover: `${this.baseUrl}${item.document.poster}`,
        source: "Atsumaru",
        source_id: item.document.id,
        link: `${this.baseUrl}/manga/${item.document.id}`,
        extra_name: item.document.englishTitle,
        description: item.document.synopsis,
        author: item.document.authors[0],
        type: "manga"
      })
    })
    return results
  }

  async getChapters(favoriteID: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/api/manga/chapters?id=${favoriteID}&filter=all&sort=desc&page=0`,
      { headers: this.headers }
    )
    if (response.status !== 200) {
      throw new Error(`Error fetching chapters from id: ${favoriteID} with status: ${response.status}`)
    }
    const responseJson: { chapters: { id: string, number: string, title: string }[], pages: number } = await response.json();
    if (responseJson.pages > 1) {
      let chapters: Chapter[] = responseJson.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${favoriteID}<0>${ch.id}`, source: "Atsumaru", language: "default" } })
      for (let i = 1; i < responseJson.pages; i++) {
        let response = await fetch(`${this.baseUrl}/api/manga/chapters?id=${favoriteID}&filter=all&sort=desc&page=${i}`,
          { headers: this.headers }
        )
        if (response.status !== 200) {
          throw new Error(`Error fetching chapters from id: ${favoriteID} with status: ${response.status}`)
        }
        const responseJsonn: { chapters: { id: string, number: string, title: string }[], pages: number } = await response.json();
        chapters = chapters.concat(responseJsonn.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${favoriteID}<0>${ch.id}`, source: "Atsumaru", language: "default" } }))
      }
      return chapters
    }
    return responseJson.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${favoriteID}<0>${ch.id}`, source: "Atsumaru", language: "default" } })
  }

  async getChapterImages(chapterID: string): Promise<string[]> {
    const splitId = chapterID.split("<0>")
    const response = await fetch(`${this.baseUrl}/api/read/chapter?mangaId=${splitId[0]}&chapterId=${splitId[1]}`)
    if (response.status !== 200) {
      throw new Error(`Error getting images for id: ${chapterID} with status code ${response.status}`)
    }
    const responseJson: { readChapter: { pages: { image: string }[] } } = await response.json()
    return responseJson.readChapter.pages.map(p => `${this.baseUrl}${p.image}`)
  }
}
