import { fetch } from "@tauri-apps/plugin-http";
import { load } from "cheerio";
import type { MangaDl } from "@/interfaces";
import type { Favorite, Chapter } from "@/types";

export class MangaSwat implements MangaDl {
  baseUrl = "https://swatscans.com"
  isMultiLanguage = false;
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Sec-GPC': '1',
    'Connection': 'keep-alive',
    'Referer': 'https://swatscans.com',
    'Origin': "https://swatscans.com",
    'Cookie': "cf_clearance=Aex6lMLWL7vEM0MJvYFBxKAodzSc25zklwr7ZKye7lY-1755560578-1.2.1.1-yZ_pu.TARsaUqj0P.kZqApEN028KB48QwWvKq782wPtY_pzNPAVqh3Jrj4tlJSSdT8EHSKg4B85_SVT8xv6nLfmpOk8gsj8N6Uhe_Qm_1vXTPE.nYFpVLVFKnw1.qWjTcFUTGdyjUZ4xVFOOdEErHbQTMi07n0w5owE5K3KhOgcmA64JT7Vl5SO2kMvFL4h5mQ3bTLeb8GbWsD3lMOc6cLpLPBUoWoQyOC7yTWWcES0; XSRF-TOKEN=eyJpdiI6IkdxSGJBcWl5dURaUGlWM1o3ZCtLeGc9PSIsInZhbHVlIjoieFpBOVJpYngySnd2eFVNNjdPRTRSQlAvYlVyZVo5ZlZCYjFiWTNsMGx4Nk9PSjd0TzBnZlczeUxzN3lWRW1QRmhiQVdVMGsrYzdlZnFzU0hudys1eFZMSmE3U3kvTnpOcituRWNLaGowSW4zdnYvT1BKODJ1dU9uWmxheCtTYzYiLCJtYWMiOiJmOWYwZDYwZDc4Y2E0OTA3NjJkNDNjMGE3NjZmN2ZiN2MwOGZlYjNlZDE5M2RlMWVkNTlhMmFiYjk1MjFmY2E0IiwidGFnIjoiIn0%3D; swat_manga_session=eyJpdiI6IjdjeG50cmNPTGNXWFZ2cFlJL1hlc2c9PSIsInZhbHVlIjoiUVU2MG1vSVhrMlpBa2JmSE5ZdEdmdU9ES3RHek52Rys3OFVwaGJZSVhKd29aUUNlSm9yZFYxNW1aZnhWWEc1bU5xcHpGNXhhTGRRKzZQS3Zxa0dFa24xM0ZvY3h3TnUwZ0R2Nm02QWxORVNjeEp5VGpFVDdJMWZKTWgwWlFUekYiLCJtYWMiOiJjNjJkYmU1YzRkNjE2MWUzYTIwMTBkNmYxY2QxMTZkN2Q1ODI3ZTQyOGJkNjI2NjE5ZTJlNDQwODliMzVkYjg5IiwidGFnIjoiIn0%3D",
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Priority': 'u=0, i',
    'TE': 'trailers'
  }

  getMangaByUrl(url: string): Promise<Favorite> {
    throw new Error("not implemented")
  }

  getMangaById(id: string): Promise<Favorite> {
    throw new Error("not implemented")
  }

  async search(query: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/?s=${query}`,
      { headers: this.headers }
    )
    if (response.status !== 200) {
      throw new Error(`Search failed with query: ${query} and status: ${response.status}`)
    }
    const text = await response.text();
    const $ = load(text)
    const results: Favorite[] = [];
    $("div.listupd")
      .find("div[data-mid]")
      .each((_, div) => {
        const a = $(div).find("a")
        const id = a.attr("href")?.split("/").at(-1) ?? ""
        results.push({
          id: 0,
          name: a.attr("title") ?? "",
          source_id: id,
          folder_name: id,
          link: a.attr("href") ?? "",
          cover: $(div).find("img").eq(1).attr("src") ?? "",
          source: "MangaSwat"
        })
      })
    return results
  }

  async getChapters(favoriteID: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/manga/${favoriteID}`,
      { headers: this.headers }
    )
    if (response.status !== 200) {
      throw new Error(`Error fetching chapters from id: ${favoriteID} with status: ${response.status}`)
    }
    const text = await response.text();
    const $ = load(text);
    const chapters: Chapter[] = []
    $("div.bixbox.bxcl").find("li[data-num]").each((_, li) => {

      chapters.push({
        number: $(li).attr("data-num") ?? "",
        chapter_id: $(li).find("a").attr("href")?.split("/").slice(-2, -1).join("/") ?? "",
        source: "MangaSwat"
      });
    })
    return chapters
  }

  async getChapterImages(chapterID: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/${chapterID}`, { headers: this.headers })
    throw new Error("not implemented")
  }
}
