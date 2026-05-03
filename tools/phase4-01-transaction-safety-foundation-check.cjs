const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "lib/transaction-safety.ts",
  "app/api/messages/thread/[id]/send/route.ts",
  "app/api/offers/place/route.ts",
  "app/api/listings/create/route.ts",
  "app/api/reports/create/route.ts",
];

const corpus = files.map((rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8")).join("\n");

const required = [
  "messageSafetySignals",
  "hasBlockedMessageSafetySignal",
  "getIdempotencyKey",
  "MESSAGE_CONTACT_DETAILS_BLOCKED",
  "For safety, keep contact details and payment details inside Bidra messages.",
  "MESSAGE_DUPLICATE_REUSED",
  "OFFER_DUPLICATE_REUSED",
  "LISTING_CREATE_DUPLICATE_REUSED",
  "REPORT_DUPLICATE_REUSED",
  "idempotency-key",
  "x-idempotency-key",
];

const forbidden = [
  "Launch mode: allow contact details in messages",
];

const missing = required.filter((item) => !corpus.includes(item));
const presentForbidden = forbidden.filter((item) => corpus.includes(item));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("PHASE4-01 transaction safety foundation check failed.");
  for (const item of missing) console.error("Missing: " + item);
  for (const item of presentForbidden) console.error("Forbidden: " + item);
  process.exit(1);
}

console.log("PHASE4-01 transaction safety foundation check passed.");
