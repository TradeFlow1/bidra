const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[TRUST-03] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[TRUST-03] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[TRUST-03] PASS: Found " + snippet);
  }
}

const fees = read("app/legal/fees/page.tsx");
const legal = read("app/legal/page.tsx");
const support = read("app/support/page.tsx");
const footer = read("components/site-footer.tsx");
const listing = read("app/listings/[id]/page.tsx");
const order = read("app/orders/[id]/page.tsx");
const bundle = fees + "\n" + legal + "\n" + support + "\n" + footer + "\n" + listing + "\n" + order;

check(fees, "Current launch pricing is simple");
check(fees, "Buyer fees");
check(fees, "$0");
check(fees, "Seller listing fees");
check(fees, "Seller success fee");
check(fees, "0% during launch");
check(fees, "This page is the public source of truth for the current fee model.");
check(fees, "Bidra does not hold pooled customer funds, process marketplace payments, or act as escrow.");
check(legal, "Current launch fee model: $0 buyer fees, $0 standard listing fees, and 0% seller success fee during launch.");
check(support, "Bidra fees");
check(support, 'href="/legal/fees"');
check(footer, "Launch pricing: $0 buyer fees, $0 standard listing fees, and 0% seller success fee.");
check(listing, "Launch pricing: $0 buyer fees");
check(listing, 'href="/legal/fees"');
check(order, "Launch pricing: $0 buyer fees");

for (const forbidden of ["Usually free", "usually free", "generally free", "Fee rules may vary", "may charge", "for example 7%", "Typical structure"]) {
  if (bundle.includes(forbidden)) {
    console.error("[TRUST-03] FAIL: Vague fee language remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[TRUST-03] PASS: Vague fee language absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[TRUST-03] Fee model check completed.");
