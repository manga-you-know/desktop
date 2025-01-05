import { fetch } from "@tauri-apps/plugin-http";
import type { MangaDl, Language, Chapter } from "@/interfaces";
import { Favorite } from "@/models";
import { LANGUAGE_LABELS } from "@/constants";

export class MangaDexDl implements MangaDl {
  baseUrl = "https://mangadex.org";
  apiUrl = "https://api.mangadex.org";
  isMultiLanguage = true;
  getMangaById(id: string): Promise<Favorite> {
    throw new Error("Method not implemented.");
  }

  async getMangaByUrl(url: string): Promise<Favorite> {
    return new Favorite({
      name: "",
      folder_name: "",
      cover: "",
      source: "",
      source_id: "",
    });
  }

  async search(query: string, limit = "20"): Promise<Favorite[]> {
    const response = await fetch(
      `${this.apiUrl}/manga?includes[]=cover_art&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&title=${encodeURIComponent(
        query
      )}&limit=${limit}`,
      {
        method: "GET",
      }
    );
    if (!response || !response.ok) {
      throw new Error(`Failed to search ${query} ${response.status}`);
    }
    const responseJson = await response.json();
    const listMangas: Favorite[] = [];
    for (const manga of await responseJson.data) {
      let idFilename = "";
      for (const type of manga.relationships) {
        if (type.type === "cover_art") {
          idFilename = type.attributes.fileName;
        }
      }
      const titleName = manga.attributes.title.en
        ? manga.attributes.title.en
        : manga.attributes.title[Object.keys(manga.attributes.title)[0]];

      listMangas.push(
        new Favorite({
          source_id: manga.id,
          name: titleName,
          folder_name: encodeURIComponent(titleName),
          link: `https://mangadex.org/title/${manga.id}`,
          //@ts-ignore
          extra_name: manga.attributes.altTitles?.length
            ? (Object.values(
                manga.attributes.altTitles[
                  Math.floor(Math.random() * manga.attributes.altTitles.length)
                ]
              )[0] ?? "")
            : "",
          description: manga.attributes.description.en,
          cover: `https://mangadex.org/covers/${manga.id}/${idFilename}`,
          source: "MangaDex",
        })
      );
    }
    return listMangas;
  }

  async getFavoriteLanguages(favoriteId: string): Promise<Language[]> {
    const response = await fetch(`${this.apiUrl}/manga/${favoriteId}`, {
      method: "GET",
    });
    if (!response || !response.ok) {
      throw new Error(`Failed to get favorite languages ${favoriteId}`);
    }
    const responseJson = await response.json();
    const languages: Language[] = [];
    responseJson.data.attributes.availableTranslatedLanguages.forEach(
      (language: string) => {
        languages.push({
          id: language,
          label: LANGUAGE_LABELS[language] ?? language,
        });
      }
    );
    return languages;
  }

  // async searchAuthor(entry: string, limit: number = 5): Promise<any | boolean> {
  //   const response = await fetch('https://api.mangadex.org/author', {
  //     method: 'GET',
  //     query: {
  //       'name': entry,
  //       'limit': limit,
  //     },
  //   });

  //   if (!response || !response.data) {
  //     return false;
  //   }
  //   return await response.json();
  // }

  async getChapters(
    mangaId: string,
    language = "en",
    limit = 500
  ): Promise<Chapter[]> {
    let offset = 0;
    const chaptersList: any[] = [];
    while (true) {
      const response = await fetch(
        `${this.apiUrl}/manga/${mangaId}/feed?limit=${limit}&translatedLanguage[]=${language}&order[chapter]=desc&includeExternalUrl=0&offset=${offset}`
      );
      const responseJson = await response.json();
      if (!response || !response.ok || responseJson.data.length === 0) {
        break;
      }
      chaptersList.push(...responseJson.data);
      if (chaptersList.length >= responseJson.total) {
        break;
      }
      offset += limit;
    }
    return chaptersList.map((chapter) => {
      return {
        number:
          chapter.attributes.chapter ?? chapter.attributes.title ?? chapter.id,
        title: chapter.attributes.title,
        chapter_id: chapter.id,
        source: "MangaDex",
        language: language,
      };
    });
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `${this.apiUrl}/at-home/server/${chapterId}?forcePort443=false`
    );

    if (response.status !== 200) {
      throw new Error(
        `Failed to get chapter images ${chapterId} ${response.status}`
      );
    }

    const chapter = await response.json();
    const chapterImgs: string[] = chapter.chapter.data.map(
      (img: string) => `${chapter.baseUrl}/data/${chapter.chapter.hash}/${img}`
    );

    return chapterImgs;
  }
}
