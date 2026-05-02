const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[PERF-02] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[PERF-02] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[PERF-02] PASS: Found " + snippet + " in " + file);
  }
}

const routes = [
  "app/page.tsx",
  "app/listings/page.tsx",
  "app/listings/[id]/page.tsx",
  "app/auth/login/page.tsx",
  "app/auth/register/page.tsx",
  "app/sell/new/page.tsx",
  "app/messages/page.tsx",
  "app/orders/page.tsx",
  "app/watchlist/page.tsx",
];

for (const route of routes) read(route);

check("app/globals.css", "PERF-02 mobile premium tap targets");
check("app/globals.css", "min-height: 44px");
check("app/globals.css", ".bd-mobile-tap-target");
check("app/page.tsx", "priority");
check("app/page.tsx", "sizes=");
check("app/page.tsx", "bd-mobile-tap-target");
check("app/listings/page.tsx", "MobileFiltersToggle");
check("app/listings/page.tsx", "browseList w-full grid grid-cols-1");
check("app/listings/page.tsx", "bd-mobile-tap-target");
check("app/listings/[id]/page.tsx", "ListingImageGallery");
check("app/listings/[id]/page.tsx", "bd-mobile-tap-target");
check("app/globals.css", "button,");

if (process.exitCode) process.exit(process.exitCode);
console.log("[PERF-02] Mobile premium audit check completed.");
