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
    if (!content.includes(item.pattern)) throw new Error(file + " missing wanted ads anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("prisma/schema.prisma", [
  { pattern: "model WantedAd", label: "wanted ad model" },
  { pattern: "enum WantedStatus", label: "wanted status enum" },
  { pattern: "wantedAds", label: "user wanted ads relation" },
  { pattern: "@@index([status])", label: "wanted status index" }
]);

check("prisma/migrations/20260621090000_add_wanted_ads/migration.sql", [
  { pattern: "CREATE TABLE \"WantedAd\"", label: "wanted table migration" },
  { pattern: "WantedStatus", label: "wanted status migration" },
  { pattern: "WantedAd_buyerId_fkey", label: "buyer relation migration" }
]);

check("app/api/wanted/create/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "listingLooksProhibited", label: "prohibited item guard" },
  { pattern: "wantedAd.create", label: "wanted ad creation" },
  { pattern: "expiresAt", label: "wanted expiry" }
]);

check("app/wanted/page.tsx", [
  { pattern: "See what buyers want", label: "wanted browse headline" },
  { pattern: "prisma.wantedAd.findMany", label: "wanted browse query" },
  { pattern: "List matching item", label: "seller listing CTA" },
  { pattern: "handover details in Bidra Messages", label: "platform handover guidance" }
]);

check("app/wanted/new/page.tsx", [
  { pattern: "Post what you want to buy", label: "wanted create headline" },
  { pattern: "WantedAdForm", label: "wanted form render" },
  { pattern: "/auth/login?next=/wanted/new", label: "auth redirect" }
]);

check("components/wanted-ad-form.tsx", [
  { pattern: "/api/wanted/create", label: "wanted create API call" },
  { pattern: "Post wanted ad", label: "wanted submit action" },
  { pattern: "payment, pickup, delivery or postage is arranged directly in Bidra Messages", label: "external handover copy" }
]);

console.log("PASS Wanted ads foundation checks completed.");
