const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  path.join(repoRoot, "app", "auth", "register", "success", "page.tsx"),
  path.join(repoRoot, "app", "dashboard", "page.tsx"),
  path.join(repoRoot, "app", "sell", "new", "page.tsx"),
  path.join(repoRoot, "app", "sell", "new", "sell-new-client.tsx"),
];

const corpus = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const required = [
  "First-run checklist",
  "Complete setup",
  "First-run setup",
  "Choose your buyer or seller path without changing account type.",
  "Set up trust basics",
  "Start as a buyer",
  "Start as a seller",
  "Follow the first-listing checklist",
  "Photos and condition",
  "Price and sale path",
  "Safe handover notes",
  "Quick first-listing check before publishing.",
  " | Buy Now $",
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

const missing = required.filter((needle) => !corpus.includes(needle));
const presentForbidden = forbiddenCodePoints.filter((codePoint) => corpus.indexOf(String.fromCharCode(codePoint)) >= 0);

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("ONBOARD-01 first-run onboarding check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  for (const item of presentForbidden) console.error(`Forbidden code point: U+${item.toString(16).toUpperCase()}`);
  process.exit(1);
}

console.log("ONBOARD-01 first-run onboarding check passed.");
