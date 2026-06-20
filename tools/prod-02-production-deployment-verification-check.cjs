const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[PROD-02] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[PROD-02] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[PROD-02] PASS: Found " + snippet + " in " + file);
  }
}

const requiredEnv = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL"
];

for (const item of requiredEnv) {
  check(".env.example", item + "=");
  check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", item);
}

const runbookAnchors = [
  "npm.cmd run launch:gate",
  "LAUNCH_READINESS_LOCAL_GATE_PASSED",
  "Production deployment is built from current `main`.",
  "Production database migrations are applied.",
  "Production admin can access `/admin/ops`.",
  "Current launch model remains platform-only.",
  "In-app marketplace payment capture remains disabled.",
  "PAYMENTS_DISABLED",
  "external_handover",
  "Invoke-WebRequest -Uri ($baseUrl + \"/api/health\")"
];

for (const item of runbookAnchors) {
  check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", item);
}

check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "Manual go/no-go checklist");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "npm.cmd run launch:gate");
check("app/api/health/route.ts", "paymentReadiness: paymentReadinessStatus()");
check("app/api/health/route.ts", "deployment: deploymentMeta()");
check("app/api/stripe/webhook/route.ts", "PAYMENTS_DISABLED");
check("app/api/stripe/webhook/route.ts", "external_handover");
check("package.json", "test:production-deployment");
check("scripts/launch-readiness.ps1", "Production deployment verification");

if (process.exitCode) process.exit(process.exitCode);
console.log("[PROD-02] Production deployment verification check completed.");
