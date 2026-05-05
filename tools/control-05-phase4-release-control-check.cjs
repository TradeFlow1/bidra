const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const registerPath = path.join(repoRoot, "docs", "BIDRA_PHASE4_LAUNCH_HARDENING_REGISTER.csv");
const register = fs.readFileSync(registerPath, "utf8");
const self = fs.readFileSync(__filename, "utf8");

function fail(message) {
  console.error("[CONTROL-05] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[CONTROL-05] PASS: " + message);
}

function requireText(source, text, label) {
  if (!source.includes(text)) {
    fail("Missing " + label + ": " + text);
  } else {
    pass("Found " + label);
  }
}

const completedRows = {
  "PHASE4-00": { pr: "120", note: "Baseline launch-hardening plan merged." },
  "MESSAGE-01": { pr: "120", note: "Completed in Phase 4 transaction-safety baseline." },
  "OFFER-02": { pr: "121", note: "Completed by PHASE4-01 transaction safety foundation." },
  "AUTH-03": { pr: "122", note: "Completed by AUTH-03 login rate limiting." },
  "PERF-01": { pr: "123", note: "Completed by PHASE4-02 launch quality foundation." },
  "UX-01": { pr: "123", note: "Completed by PHASE4-02 launch quality foundation." },
  "ADMIN-01": { pr: "124", note: "Completed by ADMIN-01 admin user moderation detail." },
};

for (const [id, expected] of Object.entries(completedRows)) {
  requireText(register, '"' + id + '"', id + " row");
  requireText(register, '"Done","' + expected.pr + '"', id + " done status and PR");
  requireText(register, expected.note, id + " completion note");
}

requireText(self, "control-05-phase4-release-control-check.cjs", "self check name");
requireText(register, "This PR reconciles Phase 4 completion evidence and protects the active register.", "CONTROL-05 active note");

const forbidden = [
  '"PHASE4-00","P0","Planning","Launch Hardening","Plan launch hardening scope","Document Phase 4 issue sequence and boundaries.","Phase 4 plan and register exist with safety-first issue order.","Static check validates Phase 4 docs.","P0;phase4;planning","In Progress"',
  '"MESSAGE-01","P0","Messaging","Transaction Safety","Block off-platform contact details server-side","Block or redact prohibited off-platform contact details in messages server-side.","API rejects or sanitizes phone, email, and external contact attempts before persistence.","Message API regression attempts prohibited contact details.","P0;messages;safety","Planned"',
  '"OFFER-02","P0","Idempotency","Transaction Safety","Prevent duplicate critical actions","Protect signup, login, listing creation, message send, offer submit, accept offer, and reports from duplicate critical records.","Duplicate requests do not create duplicate critical records.","API or static checks cover idempotency expectations.","P0;safety;api","Planned"',
  '"AUTH-03","P0","Security","Auth and Abuse Prevention","Add login rate limiting","Add per-IP and per-account throttling with friendly 429 response.","Repeated failed login attempts are throttled without exposing raw errors.","Security check simulates repeated attempts or validates rate-limit guard.","P0;security;auth","Planned"',
  '"PERF-01","P1","Performance","Launch Quality","Improve accessibility, performance, and image quality","Improve tap targets, keyboard paths, image loading, and layout stability on core public flows.","Core public routes meet defined accessibility and performance checks.","Static or smoke checks cover public browse and listing pages.","P1;performance;accessibility","Planned"',
  '"UX-01","P1","Design System","Launch Quality","Standardize toast, error, and modal components","Use consistent success, failure, confirmation, and next-action patterns across core flows.","No raw codes or silent failures remain in core launch flows.","Static check protects standard status-message usage.","P1;ux;design-system","Planned"',
  '"ADMIN-01","P1","Admin","Moderation","Build admin user moderation controls","Improve admin user detail controls for strike, block, unblock, reset, and audit visibility.","Clicked user opens the correct admin detail and actions create audit evidence.","Admin static or smoke check validates user moderation controls.","P1;admin;moderation","Planned"',
];

for (const item of forbidden) {
  if (register.includes(item)) {
    fail("Found stale Phase 4 status: " + item);
  }
}

const requiredCheckFiles = [
  "tools/phase4-00-launch-hardening-plan-check.cjs",
  "tools/message-01-safe-messaging-boundaries-check.cjs",
  "tools/phase4-01-transaction-safety-foundation-check.cjs",
  "tools/auth-03-login-rate-limiting-check.cjs",
  "tools/phase4-02-launch-quality-foundation-check.cjs",
  "tools/admin-01-admin-ops-hardening-check.cjs",
];

for (const rel of requiredCheckFiles) {
  if (!fs.existsSync(path.join(repoRoot, rel))) {
    fail("Missing completed Phase 4 check file: " + rel);
  } else {
    pass("Found completed Phase 4 check file: " + rel);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[CONTROL-05] Phase 4 release control check passed.");
