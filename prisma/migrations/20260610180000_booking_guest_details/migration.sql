-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "bookingType" TEXT NOT NULL DEFAULT 'PRIVATE';
ALTER TABLE "Booking" ADD COLUMN "guestFirstName" TEXT;
ALTER TABLE "Booking" ADD COLUMN "guestLastName" TEXT;
ALTER TABLE "Booking" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Booking" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Booking" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "Booking" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "Booking" ADD COLUMN "addressCity" TEXT;
ALTER TABLE "Booking" ADD COLUMN "addressPostalCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN "addressCountry" TEXT;
ALTER TABLE "Booking" ADD COLUMN "companyName" TEXT;
ALTER TABLE "Booking" ADD COLUMN "companyVatId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "estimatedArrival" TEXT;
ALTER TABLE "Booking" ADD COLUMN "specialRequests" TEXT;
ALTER TABLE "Booking" ADD COLUMN "additionalGuests" TEXT;
