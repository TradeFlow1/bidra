const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appRoot = path.join(repoRoot, "app");
const middlewarePath = path.join(repoRoot, "middleware.ts");

function fail(message) {
  console.error("[TRUST-01] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[TRUST-01] PASS: " + message);
}

function isRouteGroup(name) {
  return name.startsWith("(") && name.endsWith(")");
}

function hasPageForSegments(currentDir, segments, index) {
  if (!fs.existsSync(currentDir)) return false;

  if (index >= segments.length) {
    return fs.existsSync(path.join(currentDir, "page.tsx")) || fs.existsSync(path.join(currentDir, "page.ts"));
  }

  const target = segments[index];
  const direct = path.join(currentDir, target);

  if (fs.existsSync(direct) && hasPageForSegments(direct, segments, index + 1)) {
    return true;
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!isRouteGroup(entry.name)) continue;

    if (hasPageForSegments(path.join(currentDir, entry.name), segments, index)) {
      return true;
    }
  }

  return false;
}

function assertPublicRoute(route) {
  const segments = route.split("/").filter(Boolean);
  if (!hasPageForSegments(appRoot, segments, 0)) {
    fail("Missing public trust page source for route: " + route);
    return;
  }
  pass("Public trust route source exists: " + route);
}

const publicTrustRoutes = [
  "/legal",
  "/legal/fees",
  "/legal/privacy",
  "/legal/prohibited-items",
  "/legal/terms",
  "/privacy",
  "/terms",
  "/prohibited-items",
  "/support",
  "/help",
  "/contact",
  "/feedback"
];

for (const route of publicTrustRoutes) {
  assertPublicRoute(route);
}

if (!fs.existsSync(middlewarePath)) {
  fail("Missing middleware.ts");
} else {
  const middleware = fs.readFileSync(middlewarePath, "utf8");

  const requiredPublicPrefixes = [
    'pathname.startsWith("/legal")',
    'pathname.startsWith("/support")',
    'pathname.startsWith("/contact")',
    'pathname.startsWith("/feedback")',
    'pathname.startsWith("/privacy")',
    'pathname.startsWith("/terms")',
    'pathname.startsWith("/prohibited-items")',
    'pathname.startsWith("/how-it-works")',
    'pathname.startsWith("/about")',
    'pathname.startsWith("/pricing")',
    'pathname.startsWith("/browse")',
    'pathname.startsWith("/listings")'
  ];

  for (const snippet of requiredPublicPrefixes) {
    if (!middleware.includes(snippet)) {
      fail("Middleware does not explicitly keep route public: " + snippet);
    } else {
      pass("Middleware keeps route public: " + snippet);
    }
  }

  if (!middleware.includes('target.pathname = "/auth/login"')) {
    fail("Middleware login redirect is not explicit.");
  } else {
    pass("Middleware login redirect is explicit for protected routes only.");
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[TRUST-01] Public trust page check completed.");
