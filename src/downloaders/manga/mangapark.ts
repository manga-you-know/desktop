
import { fetch } from "@tauri-apps/plugin-http";
import { load } from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter } from "@/types";

export class MangaParkDl implements MangaDl {
  baseUrl = "https://mangapark.net"
  isMultiLanguage = false;
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
    // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://mangapark.io/',
    'Sec-GPC': '1',
    'Alt-Used': 'mangapark.io',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Priority': 'u=0, i',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
  }

  getMangaByUrl(url: string): Promise<Favorite> {
    throw new Error("not implemented")
  }

  getMangaById(id: string): Promise<Favorite> {
    throw new Error("not implemented")
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/apo/`,
      {
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'query': 'query get_searchComic($select: SearchComic_Select) {\n    get_searchComic(\n      select: $select\n    ) {\n      reqPage reqSize reqSort reqWord\n      newPage\n      paging { \n  total pages page init size skip limit prev next\n }\n      items {\n        id data {\n          id dbStatus name\n          origLang tranLang\n          urlPath urlCover600 urlCoverOri\n          genres altNames authors artists\n          is_hot is_new sfw_result\n          score_val follows reviews comments_total\n          max_chapterNode {\n            id data {\n              id dateCreate\n              dbStatus isFinal sfw_result\n              dname urlPath is_new\n              userId userNode {\n                id data {\n                  id name uniq avatarUrl urlPath\n                }\n              }\n            }\n          }\n        }\n        sser_follow\n        sser_lastReadChap {\n          date chapterNode {\n            id data {\n              id dbStatus isFinal sfw_result\n              dname urlPath is_new\n              userId userNode {\n                id data {\n                  id name uniq avatarUrl urlPath\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }',
          'variables': {
            'select': {
              'word': query,
              'size': 20,
              'page': 1,
              'sortby': 'field_score'
            }
          }
        })
      }
    )
    if (response.status !== 200) {
      throw new Error(`Search failed with query: ${query} and status: ${response.status}`)
    }

    const responseJson: { data: { get_searchComic: { items: Array<{ data: { name: string, urlPath: string, urlCoverOri: string, altNames: string[], authors: string[] } }> } } } = await response.json()
    const results: Favorite[] = [];
    responseJson.data.get_searchComic.items.forEach((item) => {
      results.push({
        id: -1,
        name: item.data.name,
        folder_name: item.data.urlPath.split("/").at(-1) ?? "",
        cover: `${this.baseUrl}${item.data.urlCoverOri}`,
        source: "MangaPark",
        source_id: item.data.urlPath.split("/").at(-1) ?? "",
        link: `${this.baseUrl}${item.data.urlPath}`,
        extra_name: item.data.altNames[0],
        author: item.data.authors[0],
      })
    })
    return results
  }

  async getChapters(favoriteID: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/title/${favoriteID}`,
      { headers: this.headers }
    )
    if (response.status !== 200) {
      throw new Error(`Error fetching chapters from id: ${favoriteID} with status: ${response.status}`)
    }
    const text = await response.text();
    const $ = load(text);
    const chapters: Chapter[] = []
    $(".scrollable-panel").find("div").first().find('div[class="space-x-1"]').each((_, div) => {
      const a = $(div).find("a").first()
      const title = $(div).find("span").text()
      chapters.push({
        number: a.text().replace(/[^0-9.-]/g, ''),
        title: title.startsWith(":") ? title.substring(1) : title,
        chapter_id: `${favoriteID}/${a.attr("href")?.split("/").at(-1)}`,
        source: "MangaPark",
        language: "default",
      });
    })
    return chapters
  }

  async getChapterImages(chapterID: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/title/${chapterID}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://mangapark.io/title/10749-en-one-punch-man',
        'Sec-GPC': '1',
        'Connection': 'keep-alive',
        'Cookie': 'tfv=1755279911655; wd=1721x225; theme=mdark; nsfw=2; pt_load=a',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Priority': 'u=0, i',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
    if (response.status !== 200) {
      throw new Error(`Error getting images for id: ${chapterID} with status code ${response.status}`)
    }
    const text = await response.text()
    const $ = load(text)
    return $("img").slice(1).map((_, img) => $(img).attr("src")).get()
  }
}
