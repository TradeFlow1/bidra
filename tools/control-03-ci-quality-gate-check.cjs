const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "ci.yml");

function fail(message) {
  console.error("[CONTROL-03] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[CONTROL-03] PASS: " + message);
}

if (!fs.existsSync(workflowPath)) {
  fail("Missing workflow file: .github/workflows/ci.yml");
  process.exit(process.exitCode);
}

const workflow = fs.readFileSync(workflowPath, "utf8");

const requiredSnippets = [
  "actions/checkout@v4",
  "actions/setup-node@v4",
  "node-version: 20",
  "cache: npm",
  "npm ci",
  "npm run prisma:generate",
  "npm run typecheck",
  "npm run test",
  "npm run test:smoke",
  "npm run lint",
  "npm run build"
];

for (const snippet of requiredSnippets) {
  if (!workflow.includes(snippet)) {
    fail("CI workflow is missing: " + snippet);
  } else {
    pass("CI workflow contains: " + snippet);
  }
}

const order = [
  "npm ci",
  "npm run prisma:generate",
  "npm run typecheck",
  "npm run test",
  "npm run test:smoke",
  "npm run lint",
  "npm run build"
];

let previousIndex = -1;

for (const command of order) {
  const index = workflow.indexOf(command);

  if (index === -1) {
    continue;
  }

  if (index <= previousIndex) {
    fail("CI command is out of order: " + command);
  } else {
    pass("CI command order is valid: " + command);
  }

  previousIndex = index;
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[CONTROL-03] CI quality gate check completed.");
