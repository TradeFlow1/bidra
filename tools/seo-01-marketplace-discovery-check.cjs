const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[SEO-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[SEO-01] PASS: " + message);
}

function fail(message) {
  console.error("[SEO-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  layout: read("app/layout.tsx"),
  listings: read("app/listings/page.tsx"),
  category: read("app/listings/c/[category]/page.tsx"),
  categoryLocation: read("app/listings/c/[category]/[location]/page.tsx"),
  sitemap: read("app/sitemap.ts"),
  robots: read("app/robots.ts"),
  listingSeo: read("lib/listing-seo.ts")
};

const bundle = Object.values(files).join("\n");

const required = [
  'metadataBase: new URL("https://bidra.com.au")',
  "Australian marketplace for local buying and selling",
  "Discover active Australian marketplace listings by category, suburb, city, and postcode.",
  "Buy Now or make offers while keeping pickup, postage, and handover details in Bidra Messages.",
  'locale: "en_AU"',
  "export const metadata: Metadata",
  "Browse active listings",
  "Search active Bidra marketplace listings by keyword, category, suburb, city, postcode, sale type, and condition.",
  "Popular marketplace shortcuts",
  "shareable discovery URLs",
  "active Australian marketplace listings",
  "seller trust signals",
  "Browse {category.label} by location",
  "handover details kept in Messages",
  "Discover ${category.label} marketplace listings near ${location.label} on Bidra.",
  "Compare local Buy Now and offer listings with seller trust signals and safer handover guidance.",
  'changeFrequency: "daily"',
  "priority: combo.locationSlug ? 0.75 : 0.8",
  "sitemap: `${baseUrl}/sitemap.xml`",
  'allow: ["/", "/listings", "/listings/c"]',
  '"/admin"',
  '"/api"',
  "getSeoSitemapCombos"
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing marketplace discovery SEO snippet: " + snippet);
  } else {
    pass("Found marketplace discovery SEO snippet: " + snippet);
  }
}

const forbidden = [
  "An Australian marketplace to buy and sell items safely",
  'Browse active ${category.label} listings on Bidra.',
  'Browse active ${category.label} listings near ${location.label} on Bidra.',
  "Active {category.label} listings near {location.label}.",
  "Keyword, category, location, sale type, and sort are shareable in the URL.",
  "Popular shortcuts"
];

for (const snippet of forbidden) {
  if (bundle.includes(snippet)) {
    fail("Forbidden weak SEO snippet remains: " + snippet);
  } else {
    pass("Forbidden weak SEO snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[SEO-01] Marketplace discovery SEO check completed.");
