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
    if (!content.includes(item.pattern)) throw new Error(file + " missing suburb landing anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("app/listings/near/[location]/page.tsx", [
  { pattern: "Marketplace listings near", label: "local landing metadata" },
  { pattern: "getSeoLocationListings", label: "location listing query" },
  { pattern: "Browse all listings", label: "browse all CTA" },
  { pattern: "List in", label: "local list CTA" },
  { pattern: "Keep conversations in Bidra Messages", label: "platform handover guidance" }
]);

check("lib/listing-seo.ts", [
  { pattern: "SEO_LOCATIONS", label: "SEO location registry" },
  { pattern: "kind: \"suburb\"", label: "suburb location entries" },
  { pattern: "getSeoLocationListings", label: "location listing helper" },
  { pattern: "getSeoLocationLandingLinks", label: "location sitemap helper" },
  { pattern: "locationSuburb", label: "structured suburb matching" }
]);

check("app/sitemap.ts", [
  { pattern: "getSeoLocationLandingLinks", label: "location sitemap import" },
  { pattern: "/listings/near/", label: "nearby listing sitemap path" }
]);

console.log("PASS Suburb landing page checks completed.");
