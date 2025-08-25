import { fetch } from "@tauri-apps/plugin-http";
import * as cheerio from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter, Language } from "@/types";
import { LANGUAGE_LABELS } from "@/constants";

export class ComickDl implements MangaDl {
  baseUrl = "https://comick.io";
  baseApi = "https://api.comick.fun";
  baseImage = "https://meo.comick.pictures"
  isMultiLanguage = true;

  async getMangaById(favoriteID: string): Promise<Favorite> {
    const slug = favoriteID.split("<-*->")[1]
    const response = await fetch(`${this.baseApi}/comic/${slug}/`,
      { headers: { "accept": "application/json" } }
    )
    if (response.status !== 200) {
      throw new Error(`Error getting chapters for id: ${favoriteID}`)
    }
    const resJson: { comic: { title: string, slug: string, hid: string, desc: string, md_covers: [{ b2key: string }], md_titles: [{ title: string }], links: { mal?: string, al?: string }, }, authors: [{ name: string }] } = await response.json()
    return {
      id: 0,
      name: resJson.comic.title,
      extra_name: resJson.comic.md_titles.length > 0 ? resJson.comic.md_titles[0]?.title : undefined,
      cover: `${this.baseImage}/${resJson.comic.md_covers[0].b2key}`,
      folder_name: resJson.comic.slug,
      source_id: `${resJson.comic.hid}<-*->${resJson.comic.slug}`,
      source: "Comick",
      link: `${this.baseUrl}/comic/${resJson.comic.slug}`,
      description: resJson.comic.desc,
      type: "manga",
      author: resJson.authors?.length > 0 ? resJson.authors[0]?.name : undefined,
      mal_id: resJson.comic?.links.mal,
      anilist_id: resJson.comic?.links.al
    }
  }

  async getMangaByUrl(url: string): Promise<Favorite> {
    const response = await fetch(url, {});
    throw new Error(`Failed to found manga in url: ${url}`);
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseApi}/v1.0/search/?type=comic&showall=true&q=${query}&t=true`,
      { headers: { "accept": "application/json" } }
    )
    if (response.status !== 200) {
      throw new Error(`Error when searching with query: ${query}`)
    }
    const resJson = await response.json()
    return resJson.map((data: { title: string, slug: string, hid: string, desc: string, md_covers: [{ b2key: string }], md_titles: [{ title: string }] }): Favorite => {
      return {
        id: 0,
        name: data.title,
        extra_name: data.md_titles.length > 0 ? data.md_titles[0]?.title : undefined,
        cover: `${this.baseImage}/${data.md_covers[0].b2key}`,
        folder_name: data.slug,
        source_id: `${data.hid}<-*->${data.slug}`,
        source: "Comick",
        link: `${this.baseUrl}/comic/${data.slug}`,
        description: data.desc,
        type: "manga",
      }
    })
  }

  async getFavoriteLanguages(favoriteID: string): Promise<Language[]> {
    const slug = favoriteID.split("<-*->")[1]
    const response = await fetch(`${this.baseApi}/comic/${slug}/`,
      { headers: { "accept": "application/json" } }
    )
    if (response.status !== 200) {
      throw new Error(`Error getting chapters for id: ${favoriteID}`)
    }
    const resJson: { langList: string[] } = await response.json()
    return resJson.langList.map(lang => { return { id: lang, label: LANGUAGE_LABELS[lang] ?? lang } })
  }

  async getChapters(favoriteID: string, language: string): Promise<Chapter[]> {
    const id = favoriteID.split("<-*->")[0]
    const response = await fetch(`${this.baseApi}/comic/${id}/chapters?lang=${language}&limit=10000`,
      { headers: { "accept": "application/json" } }
    )
    if (response.status !== 200) {
      throw new Error(`Error fetching chapters for id: ${favoriteID}`)
    }
    const resJson = await response.json()
    const chapters = resJson.chapters.map((chapter: { chap: string, hid: string, title: string, lang: string, md_chapters_groups: [{ md_groups: { title: string } }] }): Chapter => {
      return {
        number: chapter.chap,
        title: chapter.title,
        chapter_id: chapter.hid,
        source: "Comick",
        language: chapter.lang,
        scan: chapter.md_chapters_groups.length > 0 ? chapter.md_chapters_groups[0].md_groups.title : undefined
      }
    })
    return chapters.filter((c: Chapter) => c.number !== null || c.title !== null)
  }

  async getChapterImages(chapterID: string): Promise<string[]> {
    const response = await fetch(`${this.baseApi}/chapter/${chapterID}/get_images`,
      { headers: { "accept": "application/json" } }
    )
    if (response.status !== 200) {
      throw new Error(`Error fetching images for chapter with id: ${chapterID}`)
    }
    const resJson = await response.json()
    return resJson.map((img: { b2key: string }) => { return `${this.baseImage}/${img.b2key.replace(".png", "-m.png")}` })
  }
}
