import { fetch } from "@tauri-apps/plugin-http";
import type { ChaptersResponse, MangaDl } from "@/interfaces";
import { Chapter, Favorite } from "@/models";

export class MangaDexDl implements MangaDl {
  async getManga(url: string): Promise<Favorite> {
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
      `https://api.mangadex.org/manga?includes[]=cover_art&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&title=${encodeURIComponent(
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
  ): Promise<ChaptersResponse> {
    let offset = 0;
    const chaptersList: any[] = [];
    while (true) {
      const response = await fetch(
        `https://api.mangadex.org/manga/${mangaId}/feed?limit=${limit}&order[chapter]=desc&order[volume]=desc&includeExternalUrl=0&offset=${offset}`,
        {
          method: "GET",
        }
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

    const formattedList = chaptersList.reduce(
      (acc, chapter) => {
        const language = chapter.attributes.translatedLanguage;
        const formattedChapter = new Chapter(
          chapter.attributes.chapter,
          chapter.attributes.title,
          chapter.id,
          "MangaDex",
          language
        );
        if (!acc[language]) {
          acc[language] = [];
        }
        acc[language].push(formattedChapter);
        return acc;
      },
      {} as { [key: string]: Chapter[] }
    );
    return {
      ok: true,
      isMultipleLanguage: true,
      chapters: formattedList,
    };
  }

  async getChapterImages(chapterId: string): Promise<string[]> {
    const response = await fetch(
      `https://api.mangadex.org/at-home/server/${chapterId}?forcePort443=false`,
      {
        method: "GET",
      }
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

  //   async downloadChapter(chapterId: string): Promise<boolean> {
  //     const urls = await this.getChapterImgs(chapterId);
  //     if (!urls) return false;

  //     const chapterInfo = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=scanlation_group&includes[]=manga&includes[]=user`, {
  //       method: 'GET',
  //     });

  //     if (!chapterInfo) return false;

  //     const chapterPath = new Path(`MangaDex/${chapterInfo.data.attributes.chapter}/`);
  //     chapterPath.mkdir({ recursive: true });

  //     const hash = urls.hash;

  //     const downloadMangaPage = async (url: string, path: Path) => {
  //       const image = await fetch(url, { method: 'GET' });
  //       if (!image) return false;

  //       const file = await image.arrayBuffer();
  //       const writer = new FileWriter(path);
  //       await writer.write(file);
  //     };

  //     const threads = new ThreadManager();
  //     for (const [i, image] of urls.data.entries()) {
  //       threads.addThread(async () => {
  //         await downloadMangaPage(`https://uploads.mangadex.org/data/${hash}/${image}`, chapterPath.join(`${i.toString().padStart(4, '0')}.png`));
  //       });
  //     }
  //     threads.start();
  //     await threads.join();
  //     return true;
  //   }
}
