/*
  Warnings:

  - Added the required column `expiresAt` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `OfferMax` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PICKUP_REQUIRED';
ALTER TYPE "OrderStatus" ADD VALUE 'PICKUP_SCHEDULED';

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "pickupAvailability" JSONB,
ADD COLUMN     "pickupTimezone" TEXT NOT NULL DEFAULT 'Australia/Brisbane';

-- AlterTable
ALTER TABLE "OfferMax" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pickupScheduleLockedAt" TIMESTAMP(3),
ADD COLUMN     "pickupScheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OfferMax_expiresAt_idx" ON "OfferMax"("expiresAt");
