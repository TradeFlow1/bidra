const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error("Missing required file: " + relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, expectations) {
  const content = read(file);
  for (const item of expectations) {
    if (!content.includes(item.pattern)) throw new Error(file + " missing watchlist price history anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("prisma/migrations/20260625061000_add_watchlist_price_snapshots/migration.sql", [
  { pattern: "CREATE TABLE \"WatchlistPriceSnapshot\"", label: "snapshot table" },
  { pattern: "watchlistId", label: "watchlist relation" },
  { pattern: "buyNowPrice", label: "buy now snapshot" },
  { pattern: "currentOfferAmount", label: "offer snapshot" },
  { pattern: "ON DELETE CASCADE", label: "cascade cleanup" }
]);

check("app/api/watchlist/toggle/route.ts", [
  { pattern: "WatchlistPriceSnapshot", label: "snapshot insert" },
  { pattern: "reason", label: "snapshot reason" },
  { pattern: "WATCHED", label: "watched snapshot reason" },
  { pattern: "price: true", label: "price selected" },
  { pattern: "buyNowPrice: true", label: "buy now selected" },
  { pattern: "currentOfferAmount: true", label: "offer amount selected" }
]);

check("app/watchlist/page.tsx", [
  { pattern: "SnapshotRow", label: "snapshot row type" },
  { pattern: "WatchlistPriceSnapshot", label: "snapshot query" },
  { pattern: "persistedPriceDrop", label: "persisted price drop helper" },
  { pattern: "Price dropped since saved", label: "price drop label" },
  { pattern: "Recorded price drop", label: "recorded drop badge" },
  { pattern: "Saved at", label: "baseline price display" },
  { pattern: "persisted price history", label: "watchlist copy" }
]);

console.log("PASS Watchlist price history checks completed.");
