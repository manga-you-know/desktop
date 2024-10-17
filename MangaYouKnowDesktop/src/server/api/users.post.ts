import Database from '@tauri-apps/plugin-sql';

export default defineEventHandler(async (event) => {
  const db = await Database.load('sqlite:myk.db');
  const body = await readBody(event);
  if (body.username) {
    const user = await db.execute(
      'INSERT INTO User (username, email, icon, password) VALUES (?, ?, ?, ?)',
      [body.username, body.email, body.icon, body.password],
    );
    return user;
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Not provided a username.',
    }),
  };
});
