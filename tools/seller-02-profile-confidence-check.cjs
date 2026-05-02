const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pagePath = path.join(repoRoot, "app", "seller", "[id]", "page.tsx");
const page = fs.readFileSync(pagePath, "utf8");

const required = [
  "Buyer confidence checklist",
  "Review this seller profile before you message, buy, or make an offer.",
  "verified contact signals, transaction history, active listings, and recent completed-order feedback",
  "Use these signals together before arranging pickup, postage, or payment outside Bidra.",
  "profileSignals",
  "No profile signals yet",
  "Check listings.",
  "Message clearly.",
  "Stay safe.",
  "Keep arrangements in Messages and use safe public handover locations.",
  "toFixed(1)",
  "completed-order feedback where available",
];

const forbidden = [
  "â˜…",
  "â˜†",
  "★",
  "☆",
];

const missing = required.filter((needle) => !page.includes(needle));
const presentForbidden = forbidden.filter((needle) => page.includes(needle));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("SELLER-02 profile confidence check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);
  process.exit(1);
}

console.log("SELLER-02 profile confidence check passed.");
