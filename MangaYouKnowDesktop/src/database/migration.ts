export const migrationQuery = `
-- User table
CREATE TABLE IF NOT EXISTS user (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  email              TEXT UNIQUE,
  username           TEXT NOT NULL,
  icon               TEXT DEFAULT 'https://cdn.discordapp.com/embed/avatars/0.png',
  password           TEXT DEFAULT '',
  is_authenticated   BOOLEAN DEFAULT false
);

-- Favorite table
CREATE TABLE IF NOT EXISTS favorite (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL,
  name               TEXT NOT NULL,
  folder_name        TEXT NOT NULL,
  link               TEXT NOT NULL,
  cover              TEXT NOT NULL,
  source             TEXT NOT NULL,
  source_id          TEXT NOT NULL,
  type               TEXT DEFAULT 'manga',
  extra_name         TEXT DEFAULT '',
  title_color        TEXT DEFAULT '',
  card_color         TEXT DEFAULT '',
  grade              REAL DEFAULT 0.0,
  author             TEXT DEFAULT 'Unknow',
  is_ultra_favorite  BOOLEAN DEFAULT false,
  description        TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES user(id),
  UNIQUE (source_id, source, type, user_id)
);

-- Mark table
CREATE TABLE IF NOT EXISTS mark (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  user_id            INTEGER NOT NULL,
  color              TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Readed table
CREATE TABLE IF NOT EXISTS readed (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id         TEXT NOT NULL,
  source             TEXT NOT NULL,
  language           TEXT DEFAULT 'default',
  favorite_id        INTEGER NOT NULL,
  FOREIGN KEY (favorite_id) REFERENCES favorite(id),
  UNIQUE(chapter_id, source, language, favorite_id)
);

-- Junction table for many-to-many relation between Mark and Favorite
CREATE TABLE IF NOT EXISTS mark_favorites (
  mark_id            INTEGER NOT NULL,
  favorite_id        INTEGER NOT NULL,
  PRIMARY KEY (mark_id, favorite_id),
  FOREIGN KEY (mark_id) REFERENCES mark(id),
  FOREIGN KEY (favorite_id) REFERENCES favorite(id)
);

-- changes
ALTER TABLE favorite ADD COLUMN link TEXT NOT NULL DEFAULT '';
`