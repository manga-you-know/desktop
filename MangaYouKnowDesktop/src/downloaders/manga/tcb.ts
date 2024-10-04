import { memoize } from 'lodash';
import { fetch } from '@tauri-apps/plugin-http';
import type { MangaDl } from '~/interfaces';
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const mangas: Favorite[] = [];
    
    const links = doc.querySelectorAll('a[href*="/mangas"]');
    links.forEach((a) => {
      const img = a.querySelector('img');
      if (img) {
        mangas.push(
          new Favorite({
            name: img.getAttribute('alt') || '',
            source_id: a.getAttribute('href')?.replace('/mangas/', '') || '',
            folder_name: a.getAttribute('href')?.split('/').pop() || '',
            cover:img.getAttribute('src') || '',
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

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}mangas/${mangaId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      return [];
    }
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const chaptersList: Chapter[] = [];
    
    const chapterLinks = doc.querySelectorAll('div.col-span-2 a[href]');
    chapterLinks.forEach(a => {
      const divs = a.querySelectorAll('div');
      chaptersList.push(
        new Chapter(
					divs[0]?.textContent?.split(' ').pop() || '',
          divs[1]?.textContent || '',
          a.getAttribute('href')?.replace('/chapters/', '') || '',
					'TCB'
        )
      );
    });
    return chaptersList;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}chapters/${chapterId}`, {
      headers: this.headers,
    });
    if (response.status !== 200) {
      return [];
    }
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const chapterImgs: string[] = [];

    const imgs = doc.querySelectorAll('img.fixed-ratio-content[src]');
    imgs.forEach(img => {
      chapterImgs.push(img.getAttribute('src') || '');
    });
    return chapterImgs;
  }
}
