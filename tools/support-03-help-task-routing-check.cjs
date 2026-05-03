const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const help = fs.readFileSync(path.join(repoRoot, "app", "help", "page.tsx"), "utf8");
const support = fs.readFileSync(path.join(repoRoot, "app", "support", "page.tsx"), "utf8");
const contact = fs.readFileSync(path.join(repoRoot, "app", "contact", "page.tsx"), "utf8");

const required = [
  [help, "Choose the right help route"],
  [help, "Report a listing or message"],
  [help, "Get help with an order or account"],
  [help, "Share product feedback"],
  [support, "Use Report for moderation"],
  [support, "Use Contact for support cases"],
  [support, "Use Feedback for product ideas"],
  [support, "Bring the right evidence"],
  [contact, "Choose the right queue"],
  [contact, "Use Contact for account access, order help, billing or fee questions"],
  [contact, "Use in-product Report for unsafe listings, scams, abuse"],
];

const missing = required.filter(([content, marker]) => !content.includes(marker)).map(([, marker]) => marker);

if (missing.length > 0) {
  console.error("SUPPORT-03 help task routing check failed.");
  for (const item of missing) console.error(`Missing: ${item}`);
  process.exit(1);
}

console.log("SUPPORT-03 help task routing check passed.");
