const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const templatePath = path.join(repoRoot, ".github", "pull_request_template.md");

function fail(message) {
  console.error("[CONTROL-04] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[CONTROL-04] PASS: " + message);
}

if (!fs.existsSync(templatePath)) {
  fail("Missing .github/pull_request_template.md");
  process.exit(process.exitCode);
}

const template = fs.readFileSync(templatePath, "utf8");

const requiredSections = [
  "## Summary",
  "## Issue",
  "## Fix ID",
  "## Change type",
  "## Acceptance proof",
  "## Verification commands run",
  "## Regression protection",
  "## Screenshots or evidence",
  "## Risk and rollback",
  "## No drift checklist"
];

for (const section of requiredSections) {
  if (!template.includes(section)) {
    fail("Missing PR template section: " + section);
  } else {
    pass("Found PR template section: " + section);
  }
}

const requiredChecks = [
  "npm.cmd run typecheck",
  "npm.cmd run test",
  "npm.cmd run test:smoke",
  "npm.cmd run lint",
  "npm.cmd run build",
  "One issue only",
  "No unrelated cleanup",
  "Patch was applied by script from repo root"
];

for (const check of requiredChecks) {
  if (!template.includes(check)) {
    fail("Missing PR template proof item: " + check);
  } else {
    pass("Found PR template proof item: " + check);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[CONTROL-04] PR template check completed.");
