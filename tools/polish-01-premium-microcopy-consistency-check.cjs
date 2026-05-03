const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "app/feedback/page.tsx",
  "app/listings/page.tsx",
  "app/contact/page.tsx",
  "app/orders/page.tsx",
];

const corpus = files.map((rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8")).join("\n");

const required = [
  "Feedback - Bidra",
  "No active matches for those filters yet.",
  "right now.",
  "Search with confidence",
  "support can route it clearly",
  "Trust follow-up available.",
  "Next action: no further action needed.",
];

const forbidden = [
  "No trusted matches for those filters yet.",
  "Next action: no action needed.",
  "Optional trust follow-up.",
];

const forbiddenCodePoints = [
  0x00c2,
  0x00c3,
  0x00c6,
  0x00a2,
  0x00ac,
  0x20ac,
  0x0153,
  0xfffd,
];

const missing = required.filter((item) => !corpus.includes(item));
const presentForbidden = forbidden.filter((item) => corpus.includes(item));
const presentForbiddenCodePoints = forbiddenCodePoints.filter((codePoint) => corpus.indexOf(String.fromCharCode(codePoint)) >= 0);

if (missing.length > 0 || presentForbidden.length > 0 || presentForbiddenCodePoints.length > 0) {
  console.error("POLISH-01 premium microcopy consistency check failed.");
  for (const item of missing) console.error("Missing: " + item);
  for (const item of presentForbidden) console.error("Forbidden: " + item);
  for (const item of presentForbiddenCodePoints) console.error("Forbidden code point: U+" + item.toString(16).toUpperCase());
  process.exit(1);
}

console.log("POLISH-01 premium microcopy consistency check passed.");
