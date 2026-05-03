const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const planPath = path.join(repoRoot, "docs", "BIDRA_PHASE4_LAUNCH_HARDENING_PLAN.md");
const registerPath = path.join(repoRoot, "docs", "BIDRA_PHASE4_LAUNCH_HARDENING_REGISTER.csv");
const plan = fs.readFileSync(planPath, "utf8");
const register = fs.readFileSync(registerPath, "utf8");
const corpus = plan + "\n" + register;

const required = [
  "BIDRA Phase 4 Launch Hardening Plan",
  "Launch hardening and transaction safety.",
  "MESSAGE-01",
  "OFFER-02",
  "AUTH-03",
  "PERF-01",
  "UX-01",
  "ADMIN-01",
  "CONTROL-05",
  "Do not add escrow, in-app payment capture, shipping, courier scheduling, or buyer protection claims beyond documented V1 behaviour.",
  "Do not add third-party analytics, tracking pixels, session replay, or advertising events.",
  "Phase 4 has a documented issue sequence.",
  "Static check validates Phase 4 docs.",
];

const missing = required.filter((item) => !corpus.includes(item));

if (missing.length > 0) {
  console.error("PHASE4-00 launch hardening plan check failed.");
  for (const item of missing) console.error("Missing: " + item);
  process.exit(1);
}

console.log("PHASE4-00 launch hardening plan check passed.");
