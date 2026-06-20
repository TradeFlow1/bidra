const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error("Missing required file: " + relativePath);
  }
  return fs.readFileSync(fullPath, "utf8");
}

function assertContains(file, content, pattern, label) {
  const ok = pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern);
  if (!ok) {
    throw new Error(file + " missing guard: " + label);
  }
}

function check(file, expectations) {
  const content = read(file);
  for (const expectation of expectations) {
    assertContains(file, content, expectation.pattern, expectation.label);
  }
  console.log("PASS " + file);
}

check("app/api/offers/place/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "listing.sellerId === userId", label: "seller cannot offer on own listing" },
  { pattern: 'listing.status !== "ACTIVE"', label: "active listing guard" },
  { pattern: 'listing.type !== "OFFERABLE"', label: "offerable listing guard" },
  { pattern: "maxAmount: maxAmountCents", label: "private max amount storage" },
  { pattern: "displayAmount: displayAmount", label: "public display amount storage" },
  { pattern: "currentOfferAmount", label: "listing current offer update" },
  { pattern: "currentOfferBuyerId", label: "listing leading buyer update" }
]);

check("app/api/listings/[id]/accept-highest-offer/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "maxAmount", label: "proxy max ordering" },
  { pattern: "displayAmount || offer.amount", label: "accepted visible amount" },
  { pattern: /ListingStatus\.SOLD|["']SOLD["']/, label: "sold listing update" }
]);

check("app/api/listings/[id]/buy-now/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "sellerId", label: "seller ownership awareness" },
  { pattern: /ListingStatus\.ACTIVE|["']ACTIVE["']/, label: "active listing guard" },
  { pattern: /ListingStatus\.SOLD|["']SOLD["']/, label: "sold listing update" }
]);

check("app/api/listings/create/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "title", label: "title validation" },
  { pattern: "price", label: "price validation" },
  { pattern: "images", label: "image validation" }
]);

check("app/api/listings/[id]/update/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "existing.sellerId !== session.user.id", label: "seller ownership guard" },
  { pattern: '"SOLD"', label: "seller sold status support" },
  { pattern: "SELLER_ALLOWED_STATUSES", label: "seller status allow-list" }
]);

check("app/api/listings/[id]/questions/route.ts", [
  { pattern: "export async function GET", label: "public question read endpoint" },
  { pattern: "export async function POST", label: "public question create endpoint" },
  { pattern: "session?.user?.id", label: "question auth gate" },
  { pattern: 'listing.status !== "ACTIVE"', label: "active listing question guard" },
  { pattern: "listing.sellerId === session.user.id", label: "seller cannot ask own public question" },
  { pattern: "listingQuestion.create", label: "public question creation" }
]);

check("app/api/messages/thread/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "listingId", label: "listing thread linkage" },
  { pattern: "buyerId", label: "buyer thread linkage" }
]);

check("app/api/messages/thread/[id]/send/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "threadId", label: "thread lookup" },
  { pattern: "body", label: "message body validation" }
]);

check("app/api/reports/create/route.ts", [
  { pattern: "requireAdult", label: "adult/session gate" },
  { pattern: "reason", label: "reason validation" },
  { pattern: "report", label: "report creation" }
]);

console.log("PASS Marketplace API route guard inventory checks completed.");
