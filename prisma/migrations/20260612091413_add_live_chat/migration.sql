/*
  Warnings:

  - You are about to drop the column `maxelpaySessionId` on the `Booking` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorToken" TEXT NOT NULL,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "walletId" TEXT,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "guests" INTEGER NOT NULL DEFAULT 2,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CARD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingType" TEXT NOT NULL DEFAULT 'PRIVATE',
    "guestFirstName" TEXT,
    "guestLastName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "addressCity" TEXT,
    "addressPostalCode" TEXT,
    "addressCountry" TEXT,
    "companyName" TEXT,
    "companyVatId" TEXT,
    "estimatedArrival" TEXT,
    "specialRequests" TEXT,
    "roomPackageName" TEXT,
    "roomMealType" TEXT,
    "additionalGuests" TEXT,
    "txHash" TEXT,
    "paidAt" DATETIME,
    "expectedSats" INTEGER,
    "expectedQuotedAt" DATETIME,
    "paidClickedAt" DATETIME,
    "lastChainCheckAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CryptoWallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("additionalGuests", "addressCity", "addressCountry", "addressLine1", "addressLine2", "addressPostalCode", "bookingType", "checkIn", "checkOut", "companyName", "companyVatId", "contactEmail", "contactPhone", "createdAt", "estimatedArrival", "expectedQuotedAt", "expectedSats", "guestFirstName", "guestLastName", "guests", "id", "lastChainCheckAt", "offerId", "paidAt", "paidClickedAt", "paymentMethod", "paymentStatus", "roomMealType", "roomPackageName", "rooms", "specialRequests", "status", "totalPrice", "txHash", "userId", "walletId") SELECT "additionalGuests", "addressCity", "addressCountry", "addressLine1", "addressLine2", "addressPostalCode", "bookingType", "checkIn", "checkOut", "companyName", "companyVatId", "contactEmail", "contactPhone", "createdAt", "estimatedArrival", "expectedQuotedAt", "expectedSats", "guestFirstName", "guestLastName", "guests", "id", "lastChainCheckAt", "offerId", "paidAt", "paidClickedAt", "paymentMethod", "paymentStatus", "roomMealType", "roomPackageName", "rooms", "specialRequests", "status", "totalPrice", "txHash", "userId", "walletId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_visitorToken_key" ON "ChatConversation"("visitorToken");

-- CreateIndex
CREATE INDEX "ChatConversation_status_idx" ON "ChatConversation"("status");

-- CreateIndex
CREATE INDEX "ChatConversation_lastMessageAt_idx" ON "ChatConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatConversation_email_idx" ON "ChatConversation"("email");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
