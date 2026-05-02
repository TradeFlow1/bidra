const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[PAYMENTS-01] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[PAYMENTS-01] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[PAYMENTS-01] PASS: Found " + snippet + " in " + file);
  }
}

check("app/api/stripe/webhook/route.ts", "PAYMENTS_DISABLED");
check("app/api/stripe/webhook/route.ts", "external_handover");
check("app/api/stripe/webhook/route.ts", "Cache-Control");
check("app/api/health/route.ts", "function paymentReadinessStatus");
check("app/api/health/route.ts", "paymentReadiness");
check("app/admin/ops/page.tsx", "Payment readiness");
check("app/admin/ops/page.tsx", "In-app payments");
check("app/admin/ops/page.tsx", "Stripe configured");
check("app/legal/fees/page.tsx", "does not hold pooled customer funds");
check("app/api/orders/[id]/pay/confirm/route.ts", "paymentStepRemoved: true");

if (process.exitCode) process.exit(process.exitCode);
console.log("[PAYMENTS-01] Payment readiness check completed.");
