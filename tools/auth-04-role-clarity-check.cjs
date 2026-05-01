const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[AUTH-04] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[AUTH-04] PASS: " + message);
}

function fail(message) {
  console.error("[AUTH-04] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  headerClient: read("components/site-header-client.tsx"),
  dashboard: read("app/dashboard/page.tsx"),
  sellerDashboard: read("app/dashboard/listings/page.tsx"),
  adminHome: read("app/admin/page.tsx")
};

const bundle = Object.values(files).join("\n");

const required = [
  "role?: string | null",
  "const rawRole",
  "Admin account",
  "Buyer / seller account",
  "Current role",
  "Admin workspace",
  "Account dashboard",
  "Seller listings",
  "Buyer orders",
  "Buyer / seller messages",
  "Current account role",
  "Bidra accounts can act as buyers and sellers.",
  "Seller tools active",
  "Seller tools ready",
  "Buyer tools active",
  "Buyer tools ready",
  "Admin workspace enabled",
  "Current visible role:",
  "Seller mode is active here.",
  "Current role: Admin account",
  "trust operations workspace"
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing role clarity snippet: " + snippet);
  } else {
    pass("Found role clarity snippet: " + snippet);
  }
}

const forbidden = [
  ">Dashboard</Link>",
  ">My listings</Link>",
  ">Orders</Link>",
  "<h1 className=\"text-3xl font-semibold\">Admin</h1>"
];

for (const snippet of forbidden) {
  if (bundle.includes(snippet)) {
    fail("Forbidden unclear role snippet remains: " + snippet);
  } else {
    pass("Forbidden unclear role snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[AUTH-04] Role clarity check completed.");
