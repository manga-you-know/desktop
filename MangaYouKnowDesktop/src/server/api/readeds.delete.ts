import Database from '@tauri-apps/plugin-sql';
import type { Readed } from '~/models/readed';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  const readeds = await db.execute('DELETE FROM Readed WHERE id in (?)', [
    body.map((readed: Readed) => {
      return readed.id;
    }),
  ]);
  return readeds;
});
