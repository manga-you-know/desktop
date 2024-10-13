import { memoize } from 'lodash';
import { fetch } from '@tauri-apps/plugin-http';
import * as cheerio from 'cheerio';
import type { ChaptersResponse, MangaDl } from '~/interfaces';
import { Favorite, Chapter } from '~/models';

export class TCBScansDl implements MangaDl {
  baseUrl: string = 'https://tcbscans.me/';
  headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'dnt': '1',
    'priority': 'u=0, i',
    'referer': 'https://tcbscans.me/',
    'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-full-version': '"125.0.6422.112"',
    'sec-ch-ua-full-version-list': '"Chromium";v="125.0.6422.112", "Not.A/Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  };

  constructor() {
    this.getMangas = memoize(this.getMangas);
  }

  async getMangas(): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}projects`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      return [];
    }
    const text = await response.text();
    const $ = cheerio.load(text); // Use Cheerio to load the HTML
    const mangas: Favorite[] = [];

    $('a[href*="/mangas"]').each((_, a) => {
      const img = $(a).find('img');
      if (img.length) {
        mangas.push(
          new Favorite({
            name: img.attr('alt') || '',
            source_id: $(a).attr('href')?.replace('/mangas/', '') || '',
            folder_name: $(a).attr('href')?.split('/').pop() || '',
            link: `${this.baseUrl}${$(a).attr('href')?.slice(1)}`,
            cover: img.attr('src') || '',
            source: 'TCB',
          })
        );
      }
    });
    return mangas;
  }

  async search(query: string): Promise<Favorite[]> {
    const mangas: Favorite[] = await this.getMangas();
    const sortedMangas: Favorite[] = [];
    mangas.forEach(manga => {
      if (manga.name.toLowerCase().includes(query.toLowerCase())) {
        sortedMangas.push(manga);
      }
    });
    return sortedMangas;
  }

  async getChapters(mangaId: string): Promise<ChaptersResponse> {
    const response = await fetch(`${this.baseUrl}mangas/${mangaId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      return { ok: false };
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const chaptersList: Chapter[] = [];

    $('div.col-span-2 a[href]').each((_, a) => {
      const divs = $(a).find('div');
      chaptersList.push(
        new Chapter(
          divs.eq(0).text().split(' ').pop() || '',
          divs.eq(1).text() || '',
          $(a).attr('href')?.replace('/chapters/', '') || '',
          'TCB'
        )
      );
    });
    return { ok: true, chapters: chaptersList };
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}chapters/${chapterId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      return [];
    }
    const text = await response.text();
    const $ = cheerio.load(text);
    const chapterImgs: string[] = [];

    $('img.fixed-ratio-content[src]').each((_, img) => {
      chapterImgs.push($(img).attr('src') || '');
    });
    return chapterImgs;
  }
}
