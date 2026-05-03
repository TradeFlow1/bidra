const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const docPath = path.join(repoRoot, "docs", "ANALYTICS-01_PRIVACY_SAFE_CONVERSION_EVENT_PLAN.md");
const doc = fs.readFileSync(docPath, "utf8");

const required = [
  "ANALYTICS-01: Privacy-safe conversion event plan",
  "It does not add trackers, cookies, third-party pixels, session replay, fingerprinting, or behavioural advertising.",
  "Do not collect names, email addresses, phone numbers, street addresses, message bodies, listing descriptions, uploaded images, payment details, or exact date of birth in conversion events.",
  "Do not collect raw search text, raw location text, or free-form user input.",
  "Do not send conversion events to advertising platforms.",
  "listing_search_submitted",
  "listing_buy_now_clicked",
  "offer_started",
  "registration_completed",
  "seller_listing_published",
  "message_thread_opened",
  "report_started",
  "order_detail_opened",
  "Allowed derived properties",
  "Implementation guardrails",
  "A static regression check protects the plan.",
];

const missing = required.filter((item) => !doc.includes(item));

if (missing.length > 0) {
  console.error("ANALYTICS-01 privacy-safe conversion event plan check failed.");
  for (const item of missing) console.error("Missing: " + item);
  process.exit(1);
}

console.log("ANALYTICS-01 privacy-safe conversion event plan check passed.");
