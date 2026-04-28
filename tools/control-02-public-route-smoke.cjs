const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appRoot = path.join(repoRoot, "app");

function fail(message) {
  console.error("[CONTROL-02:SMOKE] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[CONTROL-02:SMOKE] PASS: " + message);
}

function isRouteGroup(name) {
  return name.startsWith("(") && name.endsWith(")");
}

function hasPageForSegments(currentDir, segments, index) {
  if (!fs.existsSync(currentDir)) {
    return false;
  }

  if (index >= segments.length) {
    return fs.existsSync(path.join(currentDir, "page.tsx")) || fs.existsSync(path.join(currentDir, "page.ts")) || fs.existsSync(path.join(currentDir, "route.ts"));
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const target = segments[index];

  const direct = path.join(currentDir, target);
  if (fs.existsSync(direct) && hasPageForSegments(direct, segments, index + 1)) {
    return true;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (isRouteGroup(entry.name)) {
      if (hasPageForSegments(path.join(currentDir, entry.name), segments, index)) {
        return true;
      }
    }
  }

  return false;
}

function assertRoute(route) {
  const segments = route.split("/").filter(Boolean);
  const ok = hasPageForSegments(appRoot, segments, 0);

  if (!ok) {
    fail("Missing page source for route: " + route);
    return;
  }

  pass("Route source exists: " + route);
}

const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/feedback",
  "/forgot-password",
  "/help",
  "/how-it-works",
  "/legal",
  "/legal/fees",
  "/legal/privacy",
  "/legal/prohibited-items",
  "/legal/terms",
  "/listings",
  "/privacy",
  "/prohibited-items",
  "/support",
  "/terms",
  "/watchlist"
];

for (const route of publicRoutes) {
  assertRoute(route);
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[CONTROL-02:SMOKE] Public route smoke checks completed.");
