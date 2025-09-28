export interface Suggestion {
  name: string;
  cover: string;
  folderName: string;
  author?: string;
  extraName?: string;
  description?: string;
  sources: {
    source: string;
    sourceId: string;
    link: string;
    languages: string[];
  }[];
}
