const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ADMIN-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[ADMIN-01] PASS: " + message);
}

function fail(message) {
  console.error("[ADMIN-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  adminHome: read("app/admin/page.tsx"),
  reportsPage: read("app/admin/reports/page.tsx"),
  reportDetail: read("app/admin/reports/[id]/page.tsx"),
  listingsPage: read("app/admin/listings/page.tsx"),
  usersPage: read("app/admin/users/page.tsx"),
  auditPage: read("app/admin/audit/page.tsx"),
  suspendApi: read("app/api/admin/listings/suspend/route.ts"),
  unsuspendApi: read("app/api/admin/listings/unsuspend/route.ts"),
  deleteApi: read("app/api/admin/listings/delete/route.ts"),
  blockApi: read("app/api/admin/users/block/route.ts"),
  unblockApi: read("app/api/admin/users/unblock/route.ts"),
  strikeApi: read("app/api/admin/users/strike/route.ts"),
  unstrikeApi: read("app/api/admin/users/unstrike/route.ts"),
  clearStrikeApi: read("app/api/admin/users/strike/clear/route.ts")
};

const bundle = Object.values(files).join("\n");
const apiBundle = files.suspendApi + "\n" + files.unsuspendApi + "\n" + files.deleteApi + "\n" + files.blockApi + "\n" + files.unblockApi + "\n" + files.strikeApi + "\n" + files.unstrikeApi + "\n" + files.clearStrikeApi;

const required = [
  "trust operations workspace",
  "review evidence, choose proportional actions",
  "Active moderation queue requiring evidence review.",
  "Reports still awaiting evidence review and decision.",
  "making an auditable trust decision",
  "proportional response",
  "resolving, reopening, suspending, deleting, striking, or blocking",
  "Resolve after review",
  "Reopen for more evidence",
  "Suspend listing after review",
  "Restore listing after review",
  "Remove this listing from public view after reviewing the report evidence?",
  "deleted listings are removed from public view, while suspended listings can be restored after review",
  "No listings need trust-operations review right now.",
  "No users need trust-operations review right now.",
  "Remove one policy strike after review",
  "trust-operation actions",
  "report IDs, listing IDs, user IDs, and admin IDs",
  "Sign in required before using admin actions.",
  "Admin role required for this trust operation.",
  "User id is required before applying this admin action.",
  "Strike id is required before clearing this policy strike.",
  "Block duration must be between 1 and 14 days.",
  "User not found for this admin action.",
  "Policy strike not found for this admin action.",
  "Listing suspended after trust-operations review.",
  "Listing restored after trust-operations review.",
  "Listing removed from public view after trust-operations review.",
  "Manual block applied after trust-operations review.",
  "Block removed after trust-operations review.",
  "Policy strike removed after trust-operations review.",
  "status: ListingStatus.ACTIVE",
  "data: { status: ListingStatus.SUSPENDED }"
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing admin trust snippet: " + snippet);
  } else {
    pass("Found admin trust snippet: " + snippet);
  }
}

const forbidden = [
  "Not signed in",
  "Forbidden",
  "Missing userId",
  "Missing strikeId",
  "Missing/invalid days",
  'error: "User not found"',
  'error: "Strike not found"',
  "});return",
  "});await"
];

for (const snippet of forbidden) {
  if (apiBundle.includes(snippet)) {
    fail("Forbidden unsafe admin API snippet remains: " + snippet);
  } else {
    pass("Forbidden unsafe admin API snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[ADMIN-01] Trust operations check completed.");
