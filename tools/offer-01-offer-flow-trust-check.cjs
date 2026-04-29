const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[OFFER-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[OFFER-01] PASS: " + message);
}

function fail(message) {
  console.error("[OFFER-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  placeApi: read("app/api/offers/place/route.ts"),
  acceptApi: read("app/api/listings/[id]/accept-highest-offer/route.ts"),
  listingPage: read("app/listings/[id]/page.tsx"),
  placeClient: read("app/listings/[id]/place-offer-client.tsx"),
  acceptButton: read("app/listings/[id]/accept-highest-offer-button.tsx")
};

const bundle = files.placeApi + "\n" + files.acceptApi + "\n" + files.listingPage + "\n" + files.placeClient + "\n" + files.acceptButton;
const apiBundle = files.placeApi + "\n" + files.acceptApi;
const uiBundle = files.listingPage + "\n" + files.placeClient + "\n" + files.acceptButton;

const required = [
  "Sign in required before making an offer.",
  "Your account is not eligible to make offers.",
  "Sign in required before accepting an offer.",
  "Your account is not eligible to accept offers.",
  "Listing id is required before accepting an offer.",
  "Listing not found.",
  "Only the seller can accept the highest offer.",
  "There is no offer to accept yet.",
  "We could not accept the highest offer. Please try again.",
  "Offers stay pending until the seller accepts. Ask questions in Messages first, then place only an amount you are prepared to honour.",
  "Accepting the highest offer creates an order record and marks this listing as sold.",
  "Sign in so your offer can be linked to your account and kept with the listing conversation.",
  "Offer submitted",
  "You are currently the highest offer. Keep questions and handover expectations in Messages.",
  "Increase your offer only if you are prepared to honour it.",
  "Enter your offer amount, e.g. 25.50",
  "Place offer safely",
  "This creates an order record. Keep payment, pickup, postage, and handover arrangements in Bidra Messages."
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing offer trust snippet: " + snippet);
  } else {
    pass("Found offer trust snippet: " + snippet);
  }
}

const forbiddenApi = [
  'String(gate?.reason || "Not allowed")',
  "Not signed in",
  "Not authenticated",
  "adult.reason",
  "Restricted",
  "return NextResponse.json({ ok: false }, { status: 400 })",
  "return NextResponse.json({ ok: false }, { status: 403 })",
  "return NextResponse.json({ ok: false }, { status: 404 })",
  "return NextResponse.json({ ok: false }, { status: 500 })",
  "Listing is not active",
  "Invalid offer"
];

for (const snippet of forbiddenApi) {
  if (apiBundle.includes(snippet)) {
    fail("Forbidden unsafe offer API snippet remains: " + snippet);
  } else {
    pass("Forbidden unsafe offer API snippet absent: " + snippet);
  }
}

const forbiddenUi = [
  "You need an account to place offers on Bidra.",
  "Offer submitted ✅",
  "Increase your offer to stay on top.",
  "Proceed with highest offer",
  "payment/pickup"
];

for (const snippet of forbiddenUi) {
  if (uiBundle.includes(snippet)) {
    fail("Forbidden weak offer UI snippet remains: " + snippet);
  } else {
    pass("Forbidden weak offer UI snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[OFFER-01] Offer flow trust check completed.");
