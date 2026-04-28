const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ROUTE-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[ROUTE-01] PASS: " + message);
}

function fail(message) {
  console.error("[ROUTE-01] FAIL: " + message);
  process.exitCode = 1;
}

const middleware = read("middleware.ts");
const dashAlias = read("app/dash/page.tsx");
const adminLayout = read("app/admin/layout.tsx");
const adminPage = read("app/admin/page.tsx");
const ordersPage = read("app/orders/page.tsx");

const requiredMiddleware = [
  'pathname.startsWith("/dashboard")',
  'pathname.startsWith("/dash")',
  'pathname.startsWith("/sell")',
  'pathname.startsWith("/messages")',
  'pathname.startsWith("/account")',
  'pathname.startsWith("/orders")',
  'pathname.startsWith("/notifications")',
  'pathname.startsWith("/admin")',
  'target.pathname = "/auth/login"',
  'target.searchParams.set("next", nextPath)'
];

for (const snippet of requiredMiddleware) {
  if (!middleware.includes(snippet)) {
    fail("Missing middleware route/auth snippet: " + snippet);
  } else {
    pass("Found middleware route/auth snippet: " + snippet);
  }
}

if (!dashAlias.includes('redirect("/dashboard")')) {
  fail("/dash alias does not redirect to /dashboard.");
} else {
  pass("/dash alias redirects to /dashboard.");
}

const requiredRedirects = [
  { file: "app/admin/layout.tsx", text: adminLayout, snippet: 'redirect("/auth/login?next=/admin")' },
  { file: "app/admin/page.tsx", text: adminPage, snippet: 'redirect("/auth/login?next=/admin")' },
  { file: "app/orders/page.tsx", text: ordersPage, snippet: 'redirect("/auth/login?next=/orders")' }
];

for (const item of requiredRedirects) {
  if (!item.text.includes(item.snippet)) {
    fail("Missing canonical login redirect in " + item.file + ": " + item.snippet);
  } else {
    pass("Found canonical login redirect in " + item.file);
  }
}

const forbiddenRedirects = [
  { file: "app/admin/layout.tsx", text: adminLayout, snippet: 'redirect("/auth/login")' },
  { file: "app/admin/page.tsx", text: adminPage, snippet: 'redirect("/auth/login")' },
  { file: "app/orders/page.tsx", text: ordersPage, snippet: 'redirect("/auth/login");' }
];

for (const item of forbiddenRedirects) {
  if (item.text.includes(item.snippet)) {
    fail("Bare login redirect remains in " + item.file + ": " + item.snippet);
  } else {
    pass("Bare login redirect absent in " + item.file);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[ROUTE-01] Auth redirect consistency check completed.");
