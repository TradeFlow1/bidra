const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pagePath = path.join(repoRoot, "app", "page.tsx");
const page = fs.readFileSync(pagePath, "utf8");

const required = [
  "Buy now, make offers, and sell locally with confidence",
  "trust-first marketplace",
  "Browse live deals",
  "userId ? (",
  "Sell an item",
  "href=\"/auth/register\"",
  "Create a free account",
  "No buyer fees",
  "Buy now or offer",
  "Safer handover",
  "priority",
  "sizes=",
];

const forbidden = [
  "No active listings yet. Create a free account and start the first trusted listing.",
  "<Link href=\"/auth/register\" className=\"bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white\">Create a free account</Link>\n              </div>",
];

const missing = required.filter((needle) => !page.includes(needle));
const presentForbidden = forbidden.filter((needle) => page.includes(needle));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("GROWTH-02 homepage conversion check failed.");
  for (const item of missing) {
    console.error(`Missing: ${item}`);
  }
  for (const item of presentForbidden) {
    console.error(`Forbidden: ${item}`);
  }
  process.exit(1);
}

console.log("GROWTH-02 homepage conversion check passed.");
