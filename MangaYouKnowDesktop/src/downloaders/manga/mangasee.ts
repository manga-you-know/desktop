// import axios from 'axios';
import { memoize } from 'lodash';
import { fetch } from '@tauri-apps/plugin-http';
import type { MangaDl } from '~/interfaces/mangaDl';
import { Favorite } from '~/models/favorite';
import { Chapter } from '~/models/chapter';


export class MangaSeeDl implements MangaDl {
  baseUrl: string = 'https://mangasee123.com';
  headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Alt-Used': 'www.mangasee123.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
    };
  searchRegex = /vm\.Directory\s*=\s*(\[\{.*?\}\]);/s;
  chaptersRegex = /vm\.Chapters = (\[.*?\])/s;
  chapterImagesRegex = /vm\.Images\s*=\s*(\[\{.*?\}\]);/s;

  constructor() {
    this.getMangas = memoize(this.getMangas);
  }

  async getMangas(): Promise<Favorite[]>   {
    const response = await fetch(`${this.baseUrl}/search`,{
      headers: this.headers
    })
    if (response.status !== 200) {
      console.log('error')
      return [];
    }
    const text = await response.text();
    var mangaList = JSON.parse(text.split('vm.Directory = ')[1].split(';\r\n')[0])
    return mangaList.map((manga: any) => {
      var mangaOrdered = new Favorite(
        null,
        manga.s,
        manga.i,
        manga.al[0] || '',
        `https://temp.compsci88.com/cover/${manga.i}.jpg`,
        manga.a[0] || '',
        'MangaSee',
        manga.i,
      )
      return mangaOrdered
    });
  }

  async search(query: string): Promise<Favorite[]> {
    const unsortedMangas = await this.getMangas();
    if (unsortedMangas.length === 0) {
      console.log('empty')
      return []
    }
    const mangasWithGrade: { grade: number, manga: Favorite }[] = [];
    unsortedMangas.forEach(manga => {
      let grade = 0;
      manga.name.toLowerCase()
        .includes(query.toLowerCase())? grade++ : grade;
      manga.name.toLowerCase() === query
        .toLowerCase()? grade++ : grade;
      manga.extraName?.toLowerCase()
        .includes(query.toLowerCase())? grade+=0.5 : grade;
      manga.author?.toLowerCase()
        .includes(query.toLowerCase())? grade+=0.5 : grade;
      if (grade > 0) {
        mangasWithGrade.push({ grade: grade, manga: manga });
      }
    });
    const sortedMangas = mangasWithGrade
      .sort((obj) => obj.grade)
      .reverse()
      .map(obj => {
        let manga = obj.manga;
        manga.grade = 0
        manga.author = manga.author !== ''? manga.author: 'Unknow';
        manga.extraName = manga.extraName !== ''? manga.extraName: 'Unknow';
        return obj.manga
      });
    return sortedMangas.slice(0, 20);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const response = await useFetch(`${this.baseUrl}/manga/${mangaId}`, {
      headers: this.headers
    });
    //@ts-ignore
    if (response.status !== 200) {
      return [];
    }
    const chapters: Chapter[] = [];
    //@ts-ignore
    const chaptersList = JSON.parse(response.data.match(this.chaptersRegex)[1]);
    chaptersList.forEach((chpt: any) => {
      const lastIndex = chpt.Chapter.length - 1;
      let index = ''
      if (chpt.Chapter.charAt(0) != '1') {
        index = `-index-${chpt.Chapter.charAt(0)}`
      }
      const number = chpt.Chapter.charAt(lastIndex) == '0'?
        `${parseInt(chpt.Chapter.substring(1, lastIndex))}`: `${parseInt(chpt.Chapter.substring(1, lastIndex))}.${chpt.Chapter.charAt(lastIndex)}`;
      chapters.push(
        new Chapter(
          null,
          `${mangaId}-chapter-${number}${index}-page-1.html`, 
          number, 
          chpt.ChapterName
        )
      );
    });
    return chapters;
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await useFetch(`${this.baseUrl}/read-online/${chapterId}`, {
      headers: this.headers
    });
    const images: string[] = [];
    return images;
  }
}