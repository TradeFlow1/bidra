const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pagePath = path.join(repoRoot, "app", "listings", "page.tsx");
const page = fs.readFileSync(pagePath, "utf8");

const required = [
  "Guided discovery shortcuts",
  "Start broad, then narrow by category, Buy Now, offers, or local pickup confidence.",
  "All active listings",
  "Buy Now deals",
  "Offer listings",
  "Try a broader search path",
  "Broaden",
  "Compare",
  "Search safely",
  "Browse Buy Now",
  "Browse offers",
  "bd-mobile-tap-target",
];

const forbidden = [
  "Popular marketplace shortcuts",
  "Try fewer filters, check spelling, or browse all active Australian marketplace listings.",
];

const missing = required.filter((needle) => !page.includes(needle));
const presentForbidden = forbidden.filter((needle) => page.includes(needle));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("SEARCH-03 guided discovery check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);
  process.exit(1);
}

console.log("SEARCH-03 guided discovery check passed.");
