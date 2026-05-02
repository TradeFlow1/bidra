const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[PHASE3-00] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[PHASE3-00] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[PHASE3-00] PASS: Found " + snippet + " in " + file);
  }
}

check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "PHASE3-00");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "GROWTH-02");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "LISTING-04");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "SEARCH-03");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "SELLER-02");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "ONBOARD-01");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "SEO-03");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "TRUST-05");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "SUPPORT-03");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "ANALYTICS-01");
check("docs/BIDRA_PHASE3_GROWTH_REGISTER.csv", "POLISH-01");
check("docs/BIDRA_PHASE3_GROWTH_PLAN.md", "Phase 3 focuses on growth, conversion, trust polish");
check("docs/BIDRA_PHASE3_GROWTH_PLAN.md", "No payment model change.");
check("docs/BIDRA_PHASE3_GROWTH_PLAN.md", "Production health remains green.");

if (process.exitCode) process.exit(process.exitCode);
console.log("[PHASE3-00] Growth register check completed.");
