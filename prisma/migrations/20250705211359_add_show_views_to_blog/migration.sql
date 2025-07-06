/*
  Warnings:

  - You are about to drop the column `likes` on the `Blog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Blog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "tags" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "readTime" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "claps" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" DATETIME,
    "lastEditedAt" DATETIME,
    "showViews" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Blog" ("authorId", "category", "content", "coverImage", "createdAt", "excerpt", "featured", "id", "lastEditedAt", "published", "publishedAt", "readTime", "scheduledAt", "seoDescription", "seoTitle", "slug", "status", "tags", "title", "updatedAt", "views") SELECT "authorId", "category", "content", "coverImage", "createdAt", "excerpt", "featured", "id", "lastEditedAt", "published", "publishedAt", "readTime", "scheduledAt", "seoDescription", "seoTitle", "slug", "status", "tags", "title", "updatedAt", "views" FROM "Blog";
DROP TABLE "Blog";
ALTER TABLE "new_Blog" RENAME TO "Blog";
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
