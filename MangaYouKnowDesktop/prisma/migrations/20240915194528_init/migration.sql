-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'https://cdn.discordapp.com/embed/avatars/0.png',
    "password" TEXT NOT NULL DEFAULT '',
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manga',
    "extraName" TEXT NOT NULL DEFAULT '',
    "titleColor" TEXT NOT NULL DEFAULT '',
    "cardColor" TEXT NOT NULL DEFAULT '',
    "grade" REAL NOT NULL DEFAULT 0.0,
    "author" TEXT NOT NULL DEFAULT 'Unknow',
    "isUltraFavorite" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "color" TEXT DEFAULT '',
    CONSTRAINT "Mark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Readed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chapterId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'default',
    "favoriteId" INTEGER NOT NULL,
    CONSTRAINT "Readed_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Favorite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FavoriteToMark" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FavoriteToMark_A_fkey" FOREIGN KEY ("A") REFERENCES "Favorite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FavoriteToMark_B_fkey" FOREIGN KEY ("B") REFERENCES "Mark" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_FavoriteToMark_AB_unique" ON "_FavoriteToMark"("A", "B");

-- CreateIndex
CREATE INDEX "_FavoriteToMark_B_index" ON "_FavoriteToMark"("B");
