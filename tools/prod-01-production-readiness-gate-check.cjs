const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[PROD-01] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[PROD-01] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[PROD-01] PASS: Found " + snippet + " in " + file);
  }
}

const readme = read("README.md");
const gate = read("docs/BIDRA_PRODUCTION_READINESS_GATE.md");
const envExample = read(".env.example");
const health = read("app/api/health/route.ts");
const ops = read("app/admin/ops/page.tsx");
const stripeWebhook = read("app/api/stripe/webhook/route.ts");
const packageJson = read("package.json");
const bundle = readme + "\n" + gate + "\n" + envExample + "\n" + health + "\n" + ops + "\n" + stripeWebhook + "\n" + packageJson;

for (const item of [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL"
]) {
  check(".env.example", item + "=");
  check("app/api/health/route.ts", item);
  check("app/admin/ops/page.tsx", item);
  check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", item);
}

check("README.md", "Production go-live checks");
check("README.md", "Bidra is a platform marketplace only.");
check("README.md", "Orders are sold-item records.");
check("README.md", "node .\\tools\\prod-01-production-readiness-gate-check.cjs");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "Manual go/no-go checklist");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "Rollback path");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "No-drift rule");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "PAYMENTS_DISABLED");
check("app/api/health/route.ts", "deployment: deploymentMeta()");
check("app/api/health/route.ts", "paymentReadiness: paymentReadinessStatus()");
check("app/api/health/route.ts", "Cache-Control");
check("app/api/health/route.ts", "no-store, max-age=0");
check("app/admin/ops/page.tsx", "Production readiness");
check("app/admin/ops/page.tsx", "Payment readiness");
check("app/api/stripe/webhook/route.ts", "PAYMENTS_DISABLED");
check("app/api/stripe/webhook/route.ts", "external_handover");
check("package.json", "\"typecheck\"");
check("package.json", "\"test:smoke\"");
check("package.json", "\"build\"");

for (const forbidden of [
  "Pickup is scheduled in-app.",
  "Bidra escrow",
  "payment protection",
  "buyer protection",
  "checkout.sessions.create",
  "paymentIntents.create",
  "transfers.create"
]) {
  if (bundle.includes(forbidden)) {
    console.error("[PROD-01] FAIL: Forbidden launch-readiness drift remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[PROD-01] PASS: Forbidden launch-readiness drift absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[PROD-01] Production readiness gate check completed.");
