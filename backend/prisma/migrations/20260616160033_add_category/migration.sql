-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Challenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "trickName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exampleVideoUrl" TEXT,
    "prizePoints" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'active',
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "category" TEXT NOT NULL DEFAULT 'skate',
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Challenge" ("createdAt", "creatorId", "description", "difficulty", "endsAt", "exampleVideoUrl", "id", "prizePoints", "startsAt", "status", "title", "trickName") SELECT "createdAt", "creatorId", "description", "difficulty", "endsAt", "exampleVideoUrl", "id", "prizePoints", "startsAt", "status", "title", "trickName" FROM "Challenge";
DROP TABLE "Challenge";
ALTER TABLE "new_Challenge" RENAME TO "Challenge";
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "skillLevel" TEXT NOT NULL DEFAULT 'all',
    "category" TEXT NOT NULL DEFAULT 'skate',
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("createdAt", "currentRound", "hostId", "id", "maxPlayers", "name", "skillLevel", "status") SELECT "createdAt", "currentRound", "hostId", "id", "maxPlayers", "name", "skillLevel", "status" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
