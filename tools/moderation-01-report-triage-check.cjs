const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[MODERATION-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[MODERATION-01] PASS: " + message);
}

function fail(message) {
  console.error("[MODERATION-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  adminReports: read("app/admin/reports/page.tsx"),
  adminReportDetail: read("app/admin/reports/[id]/page.tsx"),
  resolveRoute: read("app/api/admin/reports/resolve/route.ts"),
  reopenRoute: read("app/api/admin/reports/reopen/route.ts"),
  messageReportRoute: read("app/api/messages/thread/[id]/report/route.ts"),
  ftReport: read("app/ft/report/page.tsx"),
  support: read("app/support/page.tsx")
};

const bundle = Object.values(files).join("\n");

const required = [
  "Triage open reports by reason, listing context, reporter details, evidence quality, status, and action links",
  "Active moderation queue requiring evidence review and a clear next action.",
  "Reports still awaiting evidence review, safety assessment, and decision.",
  "Reports already actioned, cleared, or reopened with admin history.",
  "Resolved reports will appear here after moderators record a decision and close the report.",
  "New safety, scam, prohibited-item, and message reports will appear in the open triage queue.",
  "OPEN - needs triage",
  "RESOLVED - decision recorded",
  "Open triage record",
  "evidence quality, AI analysis, listing state, reporter details",
  "open reports need triage; resolved reports have a recorded admin decision",
  "admins make the final moderation decision",
  "audit and response-time review",
  "linked messages, listing context, and any screenshots or IDs",
  "repeated reports, prior restrictions, and related history",
  "clear, resolve, suspend, delete, strike, block, or reopen",
  "should be explainable from the report evidence",
  "Resolve after evidence review",
  "Reopen for fresh evidence",
  "Evidence guide: compare the reporter details with listing content, recent messages, account history, and any attached IDs",
  "no details supplied - use surrounding listing, message, and account context before deciding",
  "Suspend listing after evidence review",
  "Restore listing after evidence review",
  "Preserve context before actioning.",
  "REPORT_RESOLVE_AFTER_EVIDENCE_REVIEW",
  "REPORT_REOPEN_FOR_FRESH_EVIDENCE",
  "Recent messages captured for moderation evidence (last 10):",
  "use the in-product Report flow so moderation evidence is preserved",
  "moderation context and evidence are preserved",
  "moderation queue receives the right context",
  "message context, timestamps, and order or listing IDs",
  "triage evidence",
  "Keep important details in Bidra Messages."
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing moderation triage snippet: " + snippet);
  } else {
    pass("Found moderation triage snippet: " + snippet);
  }
}

const forbidden = [
  "Review report reason, listing context, reporter details, status, and action links before taking proportional moderation action.",
  "Active moderation queue requiring evidence review.",
  "Reports still awaiting evidence review and decision.",
  "Reports already actioned, cleared, or reopened with history.",
  "Open report",
  "Deterministic AI assessment.</div>",
  "Resolve after review",
  "Reopen for more evidence",
  "Suspend listing after review",
  "Restore listing after review",
  'action: "REPORT_RESOLVE"',
  'action: "REPORT_REOPEN"',
  "Recent messages (last 10):",
  "Not for listing/user safety reports.",
  "Keep important details in Bidra messages."
];

for (const snippet of forbidden) {
  if (bundle.includes(snippet)) {
    fail("Forbidden weak moderation snippet remains: " + snippet);
  } else {
    pass("Forbidden weak moderation snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[MODERATION-01] Report triage check completed.");
