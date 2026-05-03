const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const message = fs.readFileSync(path.join(repoRoot, "app", "messages", "[id]", "page.tsx"), "utf8");
const order = fs.readFileSync(path.join(repoRoot, "app", "orders", "[id]", "page.tsx"), "utf8");

const required = [
  [message, "Safety checkpoint in Messages"],
  [message, "one-time codes, ID photos, gift cards, crypto transfers"],
  [message, "pressures you to leave Bidra"],
  [order, "Handover safety checkpoint"],
  [order, "Confirm the exact item, amount, payment expectation"],
  [order, "public pickup location"],
  [order, "tracking, packaging, dispatch timing"],
];

const missing = required.filter(([content, marker]) => !content.includes(marker)).map(([, marker]) => marker);

if (order.includes("</p>              <div")) {
  missing.push("order paragraph/div formatting fix");
}

if (missing.length > 0) {
  console.error("TRUST-05 safety education moments check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  process.exit(1);
}

console.log("TRUST-05 safety education moments check passed.");
