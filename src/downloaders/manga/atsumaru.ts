import type { Favorite, Chapter, ComicSource, SearchResult } from "@/types";
import { fetch } from "@tauri-apps/plugin-http";
import { getSlug } from "@/utils";

export const Atsumaru: ComicSource = {
  baseUrl: "https://atsu.moe",
  isMultiLanguage: false,

  getMangaByUrl(_: string): Promise<Favorite> {
    throw new Error("not implemented")
  },

  getMangaById(_: string): Promise<Favorite> {
    // malId, anilistId, mangaBakaId, mangaUpdatesId
    throw new Error("not implemented")
  },

  async search(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}/collections/manga/documents/search?q=${query}&limit=24&query_by=title,englishTitle,otherNames,authors&query_by_weights=4,3,2,1&include_fields=id,title,englishTitle,poster,authors,synopsis,status,tags&num_typos=4,3,2,1`)
    if (response.status !== 200) {
      throw new Error(`Search failed with query: ${query} and status: ${response.status}`)
    }
    const responseJson: {
      hits: { document: { id: string, title: string, poster: string, englishTitle: string, synopsis: string, authors: string[] } }[]
    } = await response.json()
    return responseJson.hits.map((item) => {
      return {
        name: item.document.title,
        folderName: getSlug(item.document.title),
        cover: `${this.baseUrl}${item.document.poster}`,
        source: "Atsumaru",
        sourceID: item.document.id,
        link: `${this.baseUrl}/manga/${item.document.id}`,
        extra_name: item.document.englishTitle,
        description: item.document.synopsis,
        author: item.document.authors[0],
        type: "manga"
      }
    })
  },

  async getChapters(savedID: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/api/manga/chapters?id=${savedID}&filter=all&sort=desc&page=0`)
    if (response.status !== 200) {
      throw new Error(`Error fetching chapters from id: ${savedID} with status: ${response.status}`)
    }
    const responseJson: { chapters: { id: string, number: string, title: string }[], pages: number } = await response.json();
    if (responseJson.pages > 1) {
      let chapters: Chapter[] = responseJson.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${savedID}<0>${ch.id}`, source: "Atsumaru", language: "en" } })
      for (let i = 1; i < responseJson.pages; i++) {
        let response = await fetch(`${this.baseUrl}/api/manga/chapters?id=${savedID}&filter=all&sort=desc&page=${i}`)
        if (response.status !== 200) {
          throw new Error(`Error fetching chapters from id: ${savedID} with status: ${response.status}`)
        }
        const responseJsonn: { chapters: { id: string, number: string, title: string }[], pages: number } = await response.json();
        chapters = chapters.concat(responseJsonn.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${savedID}<0>${ch.id}`, source: "Atsumaru", language: "en" } }))
      }
      return chapters
    }
    return responseJson.chapters.map(ch => { return { number: ch.number, title: ch.title, chapter_id: `${savedID}<0>${ch.id}`, source: "Atsumaru", language: "en" } })
  },

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

