-- BTC on-chain payment verification fields
ALTER TABLE "Booking" ADD COLUMN "expectedSats" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "expectedQuotedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "paidClickedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "lastChainCheckAt" DATETIME;
