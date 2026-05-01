const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ADMIN-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[ADMIN-02] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[ADMIN-02] PASS: Found " + snippet);
  }
}

const index = read("app/admin/listings/page.tsx");
const detail = read("app/admin/listings/[id]/page.tsx");
const suspend = read("app/api/admin/listings/suspend/route.ts");
const unsuspend = read("app/api/admin/listings/unsuspend/route.ts");
const deleteRoute = read("app/api/admin/listings/delete/route.ts");
const bundle = index + "\n" + detail + "\n" + suspend + "\n" + unsuspend + "\n" + deleteRoute;

check(index, 'href={"/admin/listings/" + l.id}');
check(index, "View public listing");
check(detail, "Admin listing detail");
check(detail, "ModerationForm");
check(detail, "Moderation reason");
check(detail, 'action="/api/admin/listings/suspend"');
check(detail, 'action="/api/admin/listings/delete"');
check(detail, 'action="/api/admin/listings/unsuspend"');
check(detail, "Suspend listing");
check(detail, "Delete listing");
check(detail, "Restore listing");
check(detail, "Audit log");
check(detail, "Recent reports");
check(detail, "prisma.adminActionLog.findMany");
check(suspend, 'const reason = String(form.get("reason") || "").trim();');
check(unsuspend, 'const reason = String(form.get("reason") || "").trim();');
check(deleteRoute, 'const reason = String(form.get("reason") || "").trim();');
check(suspend, "reason: reason || null");
check(unsuspend, "reason: reason || null");
check(deleteRoute, "reason: reason || null");
check(suspend, 'action: "LISTING_SUSPEND"');
check(unsuspend, 'action: "LISTING_UNSUSPEND"');
check(deleteRoute, 'action: "LISTING_DELETE"');

for (const forbidden of ["window.confirm", "confirm(", "alert(", "prompt("]) {
  if (bundle.includes(forbidden)) {
    console.error("[ADMIN-02] FAIL: Native dialog remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[ADMIN-02] PASS: Native dialog absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[ADMIN-02] Listing moderation controls check completed.");
