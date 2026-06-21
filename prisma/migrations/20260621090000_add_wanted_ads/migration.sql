CREATE TYPE "WantedStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED', 'DELETED');

CREATE TABLE "WantedAd" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "status" "WantedStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "buyerId" TEXT NOT NULL,

    CONSTRAINT "WantedAd_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WantedAd_buyerId_idx" ON "WantedAd"("buyerId");
CREATE INDEX "WantedAd_status_idx" ON "WantedAd"("status");
CREATE INDEX "WantedAd_category_idx" ON "WantedAd"("category");
CREATE INDEX "WantedAd_location_idx" ON "WantedAd"("location");
CREATE INDEX "WantedAd_createdAt_idx" ON "WantedAd"("createdAt");

ALTER TABLE "WantedAd" ADD CONSTRAINT "WantedAd_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
