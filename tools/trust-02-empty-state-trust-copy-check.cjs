const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[TRUST-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function fail(message) {
  console.error("[TRUST-02] FAIL: " + message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("[TRUST-02] PASS: " + message);
}

const files = [
  "app/contact/contact-form-client.tsx",
  "app/contact/contact-form.tsx",
  "app/feedback/feedback-client.tsx",
  "app/listings/page.tsx",
  "app/messages/page.tsx",
  "app/orders/page.tsx",
  "app/watchlist/page.tsx"
];

const combined = files.map(read).join("\n");

const forbidden = [
  "alert(",
  "Failed to send message.",
  "Failed to send feedback.",
  "No listings found",
  "Loading…"
];

for (const phrase of forbidden) {
  if (combined.includes(phrase)) {
    fail("Forbidden raw or weak trust copy remains: " + phrase);
  } else {
    pass("Forbidden copy absent: " + phrase);
  }
}

const required = [
  "We could not send your message. Please check your details and try again.",
  "We could not send your message. Please try again shortly.",
  "We could not send your feedback. Please check your message and try again.",
  "We could not send your feedback. Please try again shortly.",
  "Checking your feedback options…",
  "No active listings yet",
  "New local listings will appear here as sellers publish them.",
  "sold-item records will appear here",
  "continue safely in Messages",
  "without contacting the seller until you are ready"
];

for (const phrase of required) {
  if (!combined.includes(phrase)) {
    fail("Required trust copy missing: " + phrase);
  } else {
    pass("Required trust copy found: " + phrase);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[TRUST-02] Empty-state trust copy check completed.");
