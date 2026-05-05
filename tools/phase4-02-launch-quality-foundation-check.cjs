const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "components/listing-card.tsx",
  "components/mobile-filters-toggle.tsx",
  "app/listings/page.tsx",
  "app/auth/login/page.tsx",
];

const corpus = files.map((rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8")).join("\n");
const listingCard = fs.readFileSync(path.join(repoRoot, "components/listing-card.tsx"), "utf8");

const required = [
  'aria-pressed={watched}',
  'Save to watchlist: ',
  'aria-live="polite"',
  'aria-controls={panelId}',
  'mobile-listing-filters-panel',
  'aria-label="Search listings by title, category, suburb, or postcode"',
  'aria-label="Filter by category"',
  'aria-label="Minimum price"',
  'role="alert"',
  'role="status"',
  'Too many login attempts. Please wait before trying again or reset your password.',
];

const forbidden = [
  'unoptimized',
  'If you are locked out, wait 15 minutes or reset your password.',
];

const missing = required.filter((item) => !corpus.includes(item));
const presentForbidden = forbidden.filter((item) => corpus.includes(item));

if (listingCard.includes("unoptimized")) {
  presentForbidden.push("ListingCard next/image unoptimized");
}

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("PHASE4-02 launch quality foundation check failed.");
  for (const item of missing) console.error("Missing: " + item);
  for (const item of presentForbidden) console.error("Forbidden: " + item);
  process.exit(1);
}

console.log("PHASE4-02 launch quality foundation check passed.");
