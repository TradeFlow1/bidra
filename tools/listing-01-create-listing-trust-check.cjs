const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[LISTING-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[LISTING-01] PASS: " + message);
}

function fail(message) {
  console.error("[LISTING-01] FAIL: " + message);
  process.exitCode = 1;
}

const sellPage = read("app/sell/new/page.tsx");
const createApi = read("app/api/listings/create/route.ts");

const requiredSellPage = [
  "Finish feedback before selling",
  "Bidra pauses new listings until overdue feedback is complete so buyers and sellers can rely on recent transaction history.",
  "Create a trusted listing with clear photos, accurate details, a local pickup area, and safe pricing before publishing.",
  "Complete feedback",
  "Create a listing"
];

for (const snippet of requiredSellPage) {
  if (!sellPage.includes(snippet)) {
    fail("Missing seller trust copy: " + snippet);
  } else {
    pass("Found seller trust copy: " + snippet);
  }
}

const requiredApi = [
  "Sign in required before creating a listing.",
  "Your account is not eligible to create listings.",
  "return NextResponse.json({ ok: false, error: message }",
  "Title must be at least 3 characters.",
  "Category is required.",
  "Invalid category.",
  "Location is required. Please set your Account location (postcode + suburb + state) and try again.",
  "Invalid location. Use format like: 4000 Brisbane, QLD (postcode + suburb + state).",
  "Add at least 1 photo to publish your listing.",
  "Images must be uploaded via Bidra (invalid image URL).",
  "This item is not permitted to be listed.",
  "LISTING_POLICY_BLOCKED_CREATE",
  "status: \"ACTIVE\"",
  "We could not create your listing. Please check your details and try again."
];

for (const snippet of requiredApi) {
  if (!createApi.includes(snippet)) {
    fail("Missing create listing trust/validation snippet: " + snippet);
  } else {
    pass("Found create listing trust/validation snippet: " + snippet);
  }
}

const forbiddenApi = [
  "reason: gate.reason",
  "Internal server error"
];

for (const snippet of forbiddenApi) {
  if (createApi.includes(snippet)) {
    fail("Forbidden unsafe create listing response remains: " + snippet);
  } else {
    pass("Forbidden unsafe create listing response absent: " + snippet);
  }
}

const forbiddenSellPage = [
  "Action required",
  "Please submit feedback to continue creating listings."
];

for (const snippet of forbiddenSellPage) {
  if (sellPage.includes(snippet)) {
    fail("Forbidden weak seller trust copy remains: " + snippet);
  } else {
    pass("Forbidden weak seller trust copy absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[LISTING-01] Create listing trust check completed.");
