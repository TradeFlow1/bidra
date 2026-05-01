const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const registerPath = path.join(repoRoot, "docs", "BIDRA_PHASE2_FIX_REGISTER.csv");

function fail(message) {
  console.error("[PHASE2-00] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[PHASE2-00] PASS: " + message);
}

if (!fs.existsSync(registerPath)) {
  fail("Missing Phase 2 register");
} else {
  pass("Phase 2 register exists");
}

const register = fs.existsSync(registerPath) ? fs.readFileSync(registerPath, "utf8") : "";
const header = register.split(/\r?\n/)[0] || "";
const required = [
  "TRUST-03",
  "AUTH-05",
  "SUPPORT-01",
  "UX-02",
  "UX-03",
  "PERF-02",
  "GROWTH-02",
  "GROWTH-03",
  "SEO-02",
  "ANALYTICS-01",
];

for (const id of required) {
  if (!register.includes(id)) {
    fail("Register missing " + id);
  } else {
    pass("Register contains " + id);
  }

  const issuePath = path.join(repoRoot, "docs", "github-issue-bodies", "phase2", id + ".md");
  if (!fs.existsSync(issuePath)) {
    fail("Missing issue body for " + id);
  } else {
    const issue = fs.readFileSync(issuePath, "utf8");
    if (!issue.includes("## Acceptance criteria") || !issue.includes("## Regression protection")) {
      fail("Issue body missing required sections for " + id);
    } else {
      pass("Issue body complete for " + id);
    }
  }
}

for (const requiredHeader of ["ID", "Priority", "Area", "Milestone", "Title", "Description", "Acceptance", "Regression", "Labels", "Status", "Branch", "PR", "TestName"]) {
  if (!header.includes(requiredHeader)) {
    fail("Register header missing " + requiredHeader);
  } else {
    pass("Register header includes " + requiredHeader);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[PHASE2-00] Million-dollar readiness register check completed.");
