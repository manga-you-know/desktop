export interface Suggestion {
  name: string;
  extra_name?: string;
  description?: string;
  folder_name: string;
  cover: string;
  sources: {
    source_id: string;
    source_name: string;
    link: string;
    language: string[];
  }[];
}
