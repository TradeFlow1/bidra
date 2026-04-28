const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const listingPath = path.join(repoRoot, "app", "listings", "[id]", "page.tsx");

function pass(message) {
  console.log("[LISTING-02] PASS: " + message);
}

function fail(message) {
  console.error("[LISTING-02] FAIL: " + message);
  process.exitCode = 1;
}

if (!fs.existsSync(listingPath)) {
  fail("Missing listing detail page.");
}

const page = fs.existsSync(listingPath) ? fs.readFileSync(listingPath, "utf8") : "";

const required = [
  "Offers are non-binding until the seller accepts. Ask questions in Messages before raising your offer.",
  "Buy Now creates a Bidra order record. Keep payment, pickup, and postage arrangements in Messages.",
  "Bidra trust reminder",
  "Active listings should stay on-platform from questions through handover, with reports available if something feels wrong.",
  "Buyer confidence checklist",
  "Ask questions before you buy or offer if anything is unclear.",
  "After a sale, keep pickup, postage, and payment details in Bidra Messages.",
  "Do not move arrangements to off-platform chats before trust is established.",
  "Check photos, description, condition, location, seller profile, and verification badges.",
  "Can you confirm pickup time, suburb, handover details, and payment expectations in Messages?",
  "Review the seller profile, verification badges, and listing history before you buy or offer.",
  "Safe buying tips",
  "Meet in a safe public place for local pickup and avoid sharing unnecessary personal details.",
  "Inspect the item and match it to the listing photos before paying.",
  "Use Bidra Messages to confirm details so there is a clear record if something goes wrong.",
  "<WatchlistButton listingId={listing.id} authed={!!userId} loginHref=\"/auth/login\" />",
  "<MessageSellerButton listingId={listing.id} />",
  "<ReportListingButton listingId={listing.id} />",
  "const isSold = listing.orders.length > 0 || listing.status !== \"ACTIVE\";"
];

for (const snippet of required) {
  if (!page.includes(snippet)) {
    fail("Missing listing detail trust snippet: " + snippet);
  } else {
    pass("Found listing detail trust snippet: " + snippet);
  }
}

const forbidden = [
  "Offers let the seller choose whether to accept. Keep questions in Messages.",
  "Buy Now creates a sold-item record so you and the seller can arrange the handover.",
  "What happens next",
  "Keep pickup, postage, and payment details in Bidra messages.",
  "Trust tips",
  "Use messages to confirm details."
];

for (const snippet of forbidden) {
  if (page.includes(snippet)) {
    fail("Forbidden weak listing detail copy remains: " + snippet);
  } else {
    pass("Forbidden weak listing detail copy absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[LISTING-02] Listing detail trust check completed.");
