const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[SEARCH-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[SEARCH-01] PASS: " + message);
}

function fail(message) {
  console.error("[SEARCH-01] FAIL: " + message);
  process.exitCode = 1;
}

const listingsPage = read("app/listings/page.tsx");
const categoryPage = read("app/listings/c/[category]/page.tsx");
const listingsApi = read("app/api/listings/route.ts");

const requiredListingsPage = [
  'cleanStr(searchParams?.q).replace(/\\s+/g, " ")',
  "Search title, category, suburb, or postcode",
  "Suburb, city, state, or postcode",
  "Use whole numbers for price filters, for example 50 or 250.",
  "keyword, category, suburb, postcode, sale type, and trusted seller filters",
  "No trusted matches for those filters yet.",
  "Try fewer filters, check spelling, or browse all active listings. Bidra only shows active marketplace listings here.",
  '{ title: { contains: q, mode: "insensitive" } }',
  '{ description: { contains: q, mode: "insensitive" } }',
  '{ category: { contains: q, mode: "insensitive" } }',
  '{ location: { contains: q, mode: "insensitive" } }',
  'take: 50'
];

for (const snippet of requiredListingsPage) {
  if (!listingsPage.includes(snippet)) {
    fail("Missing marketplace search quality snippet: " + snippet);
  } else {
    pass("Found marketplace search quality snippet: " + snippet);
  }
}

const requiredCategoryPage = [
  "Check back soon for new active listings in this category, or broaden your search across all listings."
];

for (const snippet of requiredCategoryPage) {
  if (!categoryPage.includes(snippet)) {
    fail("Missing category no-results trust copy: " + snippet);
  } else {
    pass("Found category no-results trust copy: " + snippet);
  }
}

const requiredApi = [
  "const MAX_PRICE_CENTS = 1000000 * 100",
  "function sanitizeTitle",
  "status: \"ACTIVE\"",
  "orders: { none: {} }",
  "price: { lte: MAX_PRICE_CENTS }",
  '{ title: { startsWith: "test", mode: "insensitive" } }',
  "scoreListing",
  "stale-while-revalidate=60"
];

for (const snippet of requiredApi) {
  if (!listingsApi.includes(snippet)) {
    fail("Missing listing API search/feed safeguard: " + snippet);
  } else {
    pass("Found listing API search/feed safeguard: " + snippet);
  }
}

const forbiddenListingsPage = [
  "Search keyword",
  "Use numbers for price filters.",
  "No listings match those filters yet.",
  "Try clearing filters or browse all active listings."
];

for (const snippet of forbiddenListingsPage) {
  if (listingsPage.includes(snippet)) {
    fail("Forbidden weak search/no-results copy remains: " + snippet);
  } else {
    pass("Forbidden weak search/no-results copy absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[SEARCH-01] Marketplace search quality check completed.");
