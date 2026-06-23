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
    if (!content.includes(item.pattern)) throw new Error(file + " missing promoted listing anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("lib/featured-listings.ts", [
  { pattern: "BIDRA_PROMOTED_LISTING_IDS", label: "promoted env ids" },
  { pattern: "BIDRA_FEATURED_LISTING_IDS", label: "featured env fallback" },
  { pattern: "not paid placement", label: "non-paid disclosure" },
  { pattern: "promotedListingSort", label: "configured ordering helper" }
]);

check("components/promoted-listings-rail.tsx", [
  { pattern: "Promoted listings", label: "promoted rail label" },
  { pattern: "Launch picks worth a look", label: "promoted rail heading" },
  { pattern: "promotedPlacementDisclosure", label: "disclosure render" },
  { pattern: "Bidra Messages", label: "messages handover guidance" },
  { pattern: "Browse all", label: "marketplace fallback link" }
]);

check("app/page.tsx", [
  { pattern: "PromotedListingsRail", label: "home rail render" },
  { pattern: "getPromotedListingIds", label: "home promoted ids" },
  { pattern: "promotedListingSort", label: "home promoted ordering" },
  { pattern: "status: \"ACTIVE\"", label: "active listings only" },
  { pattern: "orders: { none: {} }", label: "unsold listings only" }
]);

const forbidden = [
  "checkout.sessions.create",
  "paymentIntents.create",
  "transfers.create",
  "promotedListingPayment",
  "paidPlacementCheckout"
];

for (const file of ["lib/featured-listings.ts", "components/promoted-listings-rail.tsx", "app/page.tsx"]) {
  const content = read(file);
  for (const phrase of forbidden) {
    if (content.includes(phrase)) throw new Error(file + " contains forbidden paid promotion flow: " + phrase);
  }
}

console.log("PASS Promoted listing foundation checks completed.");
