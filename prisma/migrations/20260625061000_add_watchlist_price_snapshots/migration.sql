CREATE TABLE "WatchlistPriceSnapshot" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "buyNowPrice" INTEGER,
    "currentOfferAmount" INTEGER,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'WATCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistPriceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WatchlistPriceSnapshot_watchlistId_idx" ON "WatchlistPriceSnapshot"("watchlistId");
CREATE INDEX "WatchlistPriceSnapshot_listingId_idx" ON "WatchlistPriceSnapshot"("listingId");
CREATE INDEX "WatchlistPriceSnapshot_createdAt_idx" ON "WatchlistPriceSnapshot"("createdAt");

ALTER TABLE "WatchlistPriceSnapshot" ADD CONSTRAINT "WatchlistPriceSnapshot_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchlistPriceSnapshot" ADD CONSTRAINT "WatchlistPriceSnapshot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
