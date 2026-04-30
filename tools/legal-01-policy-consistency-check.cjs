const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[LEGAL-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[LEGAL-01] PASS: " + message);
}

function fail(message) {
  console.error("[LEGAL-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  legal: read("app/legal/page.tsx"),
  terms: read("app/legal/terms/page.tsx"),
  privacy: read("app/legal/privacy/page.tsx"),
  fees: read("app/legal/fees/page.tsx"),
  prohibited: read("app/legal/prohibited-items/page.tsx"),
  support: read("app/support/page.tsx"),
  footer: read("components/site-footer.tsx"),
  publicTerms: read("app/(public)/terms/page.tsx"),
  publicPrivacy: read("app/(public)/privacy/page.tsx"),
  publicProhibited: read("app/(public)/prohibited-items/page.tsx"),
  publicPricing: read("app/(public)/pricing/page.tsx")
};

const bundle = Object.values(files).join("\n");

const required = [
  "what risks remain with buyers and sellers",
  "users remain responsible for payment, pickup, postage, and handover decisions",
  "platform-only role, data handling, marketplace risk, and user responsibilities",
  "marketplace risk before trading",
  "platform-only role, user responsibility, marketplace risk",
  "refund decision-maker",
  "payments, pickup, postage, handover, refunds, and trading decisions",
  "Orders are sold-item records only.",
  "agree payment, pickup, postage, refund, and handover details",
  "checking items, agreeing payment, coordinating pickup or postage, and managing handover risk",
  "refund handling",
  "Disputes, refunds, item condition issues, and handover problems",
  "investigate reports, preserve audit records",
  "moderation actions, report activity, and security events",
  "preserve transaction context",
  "unsafe handover patterns",
  "off-platform payment, refunds, pickup, postage, or handover arrangements",
  "off-platform payment or refund arrangements are user responsibility",
  "sold-item record",
  "does not hold pooled customer funds or act as escrow",
  "reports may be investigated",
  "preserve audit records",
  "payment, pickup, postage, refunds, and handover decisions",
  "refund, and handover details in Bidra Messages",
  "SMS, WhatsApp, or another app",
  "preserve relevant records",
  '{ href: "/legal", label: "Legal hub" }',
  '{ href: "/legal/privacy", label: "Privacy" }',
  '{ href: "/legal/terms", label: "Terms" }',
  '{ href: "/legal/fees", label: "Fees" }',
  '{ href: "/legal/prohibited-items", label: "Prohibited items" }',
  'href="/legal/terms"',
  'href="/legal/privacy"',
  'href="/legal/prohibited-items"',
  'href="/legal/fees"'
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing legal consistency snippet: " + snippet);
  } else {
    pass("Found legal consistency snippet: " + snippet);
  }
}

const forbidden = [
  '{ href: "/privacy", label: "Privacy" }',
  '{ href: "/terms", label: "Terms" }',
  '{ href: "/prohibited-items", label: "Prohibited items" }',
  "payment provider, a shipping provider, or a pickup scheduler",
  "payment, and handover decisions",
  "outside Bidra messages",
  "Create an account. Browse active listings."
];

for (const snippet of forbidden) {
  if (bundle.includes(snippet)) {
    fail("Forbidden inconsistent legal snippet remains: " + snippet);
  } else {
    pass("Forbidden inconsistent legal snippet absent: " + snippet);
  }
}

const duplicateShortcutDirs = ["app/terms", "app/privacy", "app/prohibited-items", "app/pricing"];
for (const relativePath of duplicateShortcutDirs) {
  const fullPath = path.join(repoRoot, relativePath);
  if (fs.existsSync(fullPath)) {
    fail("Duplicate root route directory remains: " + relativePath);
  } else {
    pass("Duplicate root route directory absent: " + relativePath);
  }
}

const badIndent = files.support.includes("              <li>Someone offers overpayment") || files.support.includes("              <li>Someone refuses pickup");
if (badIndent) {
  fail("Support scam-red-flags indentation drift remains.");
} else {
  pass("Support scam-red-flags indentation is normalized.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[LEGAL-01] Policy consistency check completed.");
