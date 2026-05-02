const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const cardPath = path.join(repoRoot, "components", "listing-card.tsx");
const card = fs.readFileSync(cardPath, "utf8");

const badSep = String.fromCharCode(0x00c3, 0x00a2, 0x00e2, 0x201a, 0x00ac, 0x00c2, 0x00ba);
const badStar = String.fromCharCode(0x00e2, 0x02dc, 0x2026);
const badEmptyStar = String.fromCharCode(0x00e2, 0x02dc, 0x2020);

const required = [
  "Highest offers",
  "Fixed price",
  "Current best offer",
  "Buy now price",
  "Lead with your strongest offer.",
  "Be the first to make an offer.",
  "Buy now before someone else does.",
  "No offer history yet",
  "View offers",
  "Buy now",
  "View item",
  "emailVerified",
  "ratingAvg",
  "showWatchButton",
  "String(full) + \"\/5\"",
];

const forbidden = [
  "☆",
  "★",
  "Â",
  "Ã",
  badSep,
  badStar,
  badEmptyStar,
  "{isTimedOffers ? \"Offers\" : hasBuyNow ? \"Buy Now\" : \"Fixed\"}",
  "<div className=\"font-semibold text-[#0F172A]\">View</div>",
];

const missing = required.filter((needle) => !card.includes(needle));
const presentForbidden = forbidden.filter((needle) => card.includes(needle));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("LISTING-04 card conversion check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);
  process.exit(1);
}

console.log("LISTING-04 card conversion check passed.");
