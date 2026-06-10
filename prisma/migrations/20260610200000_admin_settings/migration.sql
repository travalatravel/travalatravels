-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "passwordHash" TEXT,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "AdminSettings" ("id", "passwordHash", "updatedAt")
VALUES ('default', NULL, CURRENT_TIMESTAMP);
