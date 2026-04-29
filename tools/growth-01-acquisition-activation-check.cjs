const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[GROWTH-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[GROWTH-01] PASS: " + message);
}

function fail(message) {
  console.error("[GROWTH-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  home: read("app/page.tsx"),
  howItWorks: read("app/how-it-works/page.tsx"),
  sellNew: read("app/sell/new/page.tsx"),
  register: read("app/auth/register/page.tsx"),
  registerSuccess: read("app/auth/register/success/page.tsx"),
  listings: read("app/listings/page.tsx"),
  listingDetail: read("app/listings/[id]/page.tsx"),
  footer: read("components/site-footer.tsx"),
  listingCard: read("components/listing-card.tsx")
};

const bundle = Object.values(files).join("\n");

const required = [
  "Browse active listings",
  "Create a free account",
  "Discover active marketplace categories",
  "Categories will appear as sellers publish active Buy Now and offer listings.",
  "Start buying",
  "Latest active listings",
  "Create a free account and start the first trusted listing.",
  "Make seller-reviewed offers",
  "Sellers can create timed-offer listings from the sell flow.",
  "Buy Now activation",
  "Create a listing with a clear fixed price to activate buyers faster.",
  "Start selling",
  "Browse trusted listings",
  "Create a free account and activate trust",
  "buyer-ready details",
  "Convert interest in Messages",
  "strengthen seller and buyer trust signals",
  "Create a buyer-ready listing",
  "sale format that helps buyers act with confidence",
  "Create your free marketplace account",
  "start buying, selling, watching, and messaging with trust signals",
  "Activate your account with trust basics",
  "activate browsing, watchlist, buying, selling, and messaging",
  "Create free account",
  "browse active listings, watch items, create listings, buy, offer, and message safely",
  "Browse active marketplace listings",
  "Create a free account to watch items, buy, offer, sell, and message safely.",
  "buyers can revisit and sellers can promote",
  "Sign up to watch items, message sellers, buy now, or place offers.",
  "Create a free account to watch this item, message the seller, buy now, or place an offer",
  "Buyer activation checklist",
  "before you buy, offer, or message",
  "Create account",
  "browse, watch, sell, buy, offer",
  "Create an account. Browse active listings.",
  'aria-label={"View listing and trust signals for " + title}'
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing acquisition activation snippet: " + snippet);
  } else {
    pass("Found acquisition activation snippet: " + snippet);
  }
}

const forbidden = [
  "Watchlist</Link>",
  "Featured categories",
  "Latest listings",
  "Make an offer</h2>",
  "Ready to buy</h2>",
  "Support and safety",
  "Create your account</h1>",
  "Before you create an account",
  'Create account"}',
  "Buyer confidence checklist",
  "Buy now. Make offers. Arrange handover in messages."
];

for (const snippet of forbidden) {
  if (bundle.includes(snippet)) {
    fail("Forbidden weak acquisition snippet remains: " + snippet);
  } else {
    pass("Forbidden weak acquisition snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[GROWTH-01] Acquisition activation check completed.");
