const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const home = fs.readFileSync(path.join(repoRoot, "app", "page.tsx"), "utf8");
const sitemap = fs.readFileSync(path.join(repoRoot, "app", "sitemap.ts"), "utf8");

const requiredHome = [
  "export const metadata: Metadata = {",
  "Bidra marketplace | Buy Now and offers in Australia",
  "Australian trust-first marketplace",
  "keywords: [",
  "marketplaceJsonLd",
  "Organization",
  "WebSite",
  "SearchAction",
  "ItemList",
  "Active Bidra marketplace listings",
  "dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceJsonLd) }}",
];

const requiredSitemap = [
  "`${baseUrl}/how-it-works`",
  "`${baseUrl}/help`",
  "`${baseUrl}/support`",
  "`${baseUrl}/legal`",
  "`${baseUrl}/legal/terms`",
  "`${baseUrl}/legal/privacy`",
  "`${baseUrl}/legal/fees`",
  "`${baseUrl}/legal/prohibited-items`",
];

const missingHome = requiredHome.filter((needle) => !home.includes(needle));
const missingSitemap = requiredSitemap.filter((needle) => !sitemap.includes(needle));

if (missingHome.length > 0 || missingSitemap.length > 0) {
  console.error("SEO-03 marketplace landing SEO check failed.");
  for (const item of missingHome) console.error(`Missing homepage marker: ${item}`);
  for (const item of missingSitemap) console.error(`Missing sitemap marker: ${item}`);
  process.exit(1);
}

console.log("SEO-03 marketplace landing SEO check passed.");
