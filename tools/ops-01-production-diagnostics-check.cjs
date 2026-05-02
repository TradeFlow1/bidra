const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[OPS-01] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[OPS-01] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[OPS-01] PASS: Found " + snippet + " in " + file);
  }
}

check("app/api/ping/route.ts", "deploymentMeta");
check("app/api/ping/route.ts", "Cache-Control");
check("app/api/health/route.ts", "prisma.$queryRaw");
check("app/api/health/route.ts", "requiredEnvStatus");
check("app/admin/ops/page.tsx", "Operator diagnostics");
check("app/admin/ops/page.tsx", "Required environment variables");
check("app/admin/ops/page.tsx", "Optional integration variables");
check("app/admin/page.tsx", "/admin/ops");
check(".env.example", "DATABASE_URL=");
check(".env.example", "NEXTAUTH_SECRET=");
check(".env.example", "NEXT_PUBLIC_SITE_URL=https://www.bidra.com.au");

if (process.exitCode) process.exit(process.exitCode);
console.log("[OPS-01] Production diagnostics check completed.");
