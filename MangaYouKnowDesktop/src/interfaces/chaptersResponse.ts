import type { Chapter } from '~/models';

export interface ChaptersResponse {
  ok: boolean;
  isMultipleLanguage?: boolean;
  chapters?:
    | Chapter[]
    | {
        [key: string]: Chapter[];
      };
}
