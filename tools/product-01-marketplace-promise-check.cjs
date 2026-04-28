const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function fail(message) {
  console.error("[PRODUCT-01] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[PRODUCT-01] PASS: " + message);
}

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail("Missing file: " + relativePath);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const files = [
  "app/how-it-works/page.tsx",
  "app/support/page.tsx",
  "app/legal/terms/page.tsx",
  "components/site-footer.tsx"
];

const combined = files.map(read).join("\n");

const requiredPhrases = [
  "trust-first local marketplace",
  "Buy Now",
  "make offers",
  "arrange pickup or postage",
  "Bidra is the platform only",
  "not the seller",
  "auctioneer",
  "escrow holder",
  "payment provider",
  "shipping provider",
  "pickup scheduler",
  "Orders are sold-item records"
];

for (const phrase of requiredPhrases) {
  if (!combined.includes(phrase)) {
    fail("Missing approved marketplace promise phrase: " + phrase);
  } else {
    pass("Found approved marketplace promise phrase: " + phrase);
  }
}

const forbiddenPatterns = [
  /pickup is scheduled in-app/i,
  /pickup timing is scheduled in-app/i,
  /scheduled in-app/i,
  /in-app payment step/i,
  /complete the order inside Bidra/i,
  /follow the order flow/i,
  /payment protection/i,
  /Bidra escrow/i,
  /escrow service/i
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(combined)) {
    fail("Forbidden V2 or unsupported promise remains: " + pattern);
  } else {
    pass("Forbidden promise absent: " + pattern);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[PRODUCT-01] Marketplace promise check completed.");
