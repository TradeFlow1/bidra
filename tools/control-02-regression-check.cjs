const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function fail(message) {
  console.error("[CONTROL-02] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[CONTROL-02] PASS: " + message);
}

function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function assertFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail("Missing required file: " + relativePath);
    return false;
  }
  pass("Found " + relativePath);
  return true;
}

const packageJson = readJson("package.json");
const scripts = packageJson.scripts || {};

const requiredScripts = {
  "prisma:generate": "prisma generate",
  "build": "next build",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "node tools/control-02-regression-check.cjs",
  "test:smoke": "node tools/control-02-public-route-smoke.cjs"
};

for (const [name, expected] of Object.entries(requiredScripts)) {
  if (!scripts[name]) {
    fail("Missing package script: " + name);
    continue;
  }

  if (!String(scripts[name]).includes(expected)) {
    fail("Package script " + name + " does not include expected command: " + expected);
    continue;
  }

  pass("Package script exists: " + name);
}

const requiredFiles = [
  "docs/BIDRA_FIX_REGISTER.csv",
  "docs/BIDRA_MILLION_DOLLAR_FIX_PLAN.md",
  "docs/github-issue-bodies/CONTROL-01.md",
  "docs/github-issue-bodies/CONTROL-02.md",
  "tools/create-bidra-fix-register.ps1",
  "tools/seed-bidra-github-issues.ps1"
];

for (const file of requiredFiles) {
  assertFile(file);
}

const fixRegisterPath = path.join(repoRoot, "docs", "BIDRA_FIX_REGISTER.csv");
const fixRegister = fs.readFileSync(fixRegisterPath, "utf8");

const requiredIssueIds = [
  "CONTROL-01",
  "CONTROL-02",
  "CONTROL-03",
  "CONTROL-04",
  "PRODUCT-01",
  "TRUST-01",
  "TRUST-02",
  "ROUTE-01",
  "AUTH-01",
  "AUTH-02",
  "AUTH-03",
  "SEARCH-01",
  "LISTING-01",
  "MESSAGE-01",
  "OFFER-01",
  "OFFER-02",
  "ADMIN-01",
  "SEO-01",
  "GROWTH-01"
];

for (const issueId of requiredIssueIds) {
  if (!fixRegister.includes(issueId)) {
    fail("Fix register is missing " + issueId);
  } else {
    pass("Fix register contains " + issueId);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[CONTROL-02] Regression harness checks completed.");
