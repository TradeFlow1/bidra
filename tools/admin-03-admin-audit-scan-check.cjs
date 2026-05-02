const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ADMIN-03] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[ADMIN-03] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[ADMIN-03] PASS: Found " + snippet + " in " + file);
  }
}

check("app/admin/audit/page.tsx", "function auditPriority");
check("app/admin/audit/page.tsx", "Review cue:");
check("app/admin/audit/page.tsx", "shortJsonSummary");
check("app/admin/events/page.tsx", "function eventPriority");
check("app/admin/events/page.tsx", "const ipText = dataText");
check("app/admin/events/page.tsx", "User agent:");
check("app/admin/events/page.tsx", "Category:");

if (process.exitCode) process.exit(process.exitCode);
console.log("[ADMIN-03] Admin audit scan check completed.");
