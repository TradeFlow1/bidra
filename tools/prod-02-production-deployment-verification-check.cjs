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

const deployment = read("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md");
const readiness = read("docs/BIDRA_PRODUCTION_READINESS_GATE.md");
const health = read("app/api/health/route.ts");
const envExample = read(".env.example");
const migrations = fs.existsSync(path.join(repoRoot, "prisma", "migrations"))
  ? fs.readdirSync(path.join(repoRoot, "prisma", "migrations")).join("\\n")
  : "";

for (const item of [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL"
]) {
  check(".env.example", item + "=");
  check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", item);
}

for (const item of [
  "20251226190000_baseline",
  "20251226203000_feedback_patch",
  "20260213182735_drift_baseline_applied",
  "20260214095423_v2_offer_expires_at",
  "20260407_chunk1_direct_reschedule_flow_manual"
]) {
  if (!migrations.includes(item)) {
    console.error("[PROD-02] FAIL: Missing migration directory " + item);
    process.exitCode = 1;
  } else {
    console.log("[PROD-02] PASS: Found migration directory " + item);
  }
}

check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "Vercel CLI was not installed or not available on PATH");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "vercel env ls");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "vercel ls");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", 'Invoke-WebRequest -Uri ($baseUrl + "/api/health")');
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "node .\\tools\\inspect-prod-migrations.js");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "node .\\tools\\inspect-prod-counts.js");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "Production deployment is built from current `main`.");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "Production admin can access `/admin/ops`.");
check("docs/BIDRA_PRODUCTION_DEPLOYMENT_VERIFICATION.md", "Current launch model remains platform-only with in-app payments disabled.");
check("docs/BIDRA_PRODUCTION_READINESS_GATE.md", "Manual go/no-go checklist");
check("app/api/health/route.ts", "paymentReadiness: paymentReadinessStatus()");
check("app/api/health/route.ts", "deployment: deploymentMeta()");
check(".env.example", "NEXT_PUBLIC_SITE_URL=https://www.bidra.com.au");

if (!deployment.includes("Do not mark Bidra production-ready until all of these are true:")) {
  console.error("[PROD-02] FAIL: Missing go-live decision gate.");
  process.exitCode = 1;
} else {
  console.log("[PROD-02] PASS: Found go-live decision gate.");
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[PROD-02] Production deployment verification check completed.");
