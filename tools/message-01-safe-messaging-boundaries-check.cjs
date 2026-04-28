const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[MESSAGE-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[MESSAGE-01] PASS: " + message);
}

function fail(message) {
  console.error("[MESSAGE-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  inboxPage: read("app/messages/page.tsx"),
  threadPage: read("app/messages/[id]/page.tsx"),
  sendBox: read("app/messages/[id]/components/send-box.tsx"),
  inboxApi: read("app/api/messages/inbox/route.ts"),
  threadApi: read("app/api/messages/thread/route.ts"),
  sendApi: read("app/api/messages/thread/[id]/send/route.ts"),
  deleteApi: read("app/api/messages/thread/[id]/delete/route.ts"),
  reportApi: read("app/api/messages/thread/[id]/report/route.ts")
};

const apiBundle = files.inboxApi + "\n" + files.threadApi + "\n" + files.sendApi + "\n" + files.deleteApi + "\n" + files.reportApi;
const uiBundle = files.inboxPage + "\n" + files.threadPage + "\n" + files.sendBox;

const requiredApi = [
  "Sign in required to use Bidra messages.",
  "Your account is not eligible to use Bidra messages.",
  "You can only access message threads you are part of.",
  "Messages can only be started from active listings.",
  "contactInfoSignals(text)",
  "MESSAGE_THREAD_REPORTED",
  "MESSAGE_THREAD_DELETED"
];

for (const snippet of requiredApi) {
  if (!apiBundle.includes(snippet)) {
    fail("Missing safe messaging API snippet: " + snippet);
  } else {
    pass("Found safe messaging API snippet: " + snippet);
  }
}

const requiredUi = [
  "Use Bidra Messages to confirm pickup, postage, payment expectations, and handover details. Keep agreements on-platform for both buyer and seller.",
  "Keep listing and order conversations in one trusted place, including pickup, postage, payment expectations, and handover agreements.",
  "Messages from listings and sold-item records will appear here. Keep pickup, postage, payment expectations, and handover details in Bidra Messages.",
  "Use Bidra Messages to keep a clear record. Confirm pickup, postage, payment expectations, and handover details here. Never share passwords, verification codes, or suspicious payment requests.",
  "Keep pickup, postage, payment expectations, and handover agreements in Bidra Messages.",
  "If anything seems suspicious, report the chat so Bidra can review the conversation history.",
  "Keep messages relevant to the item, pickup, postage, payment expectations, and sale. Do not move arrangements off-platform before trust is established.",
  "Ask about the item, pickup, postage, payment expectations, or handover details…"
];

for (const snippet of requiredUi) {
  if (!uiBundle.includes(snippet)) {
    fail("Missing safe messaging UI snippet: " + snippet);
  } else {
    pass("Found safe messaging UI snippet: " + snippet);
  }
}

const forbiddenEverywhere = [
  "Not authenticated",
  "adult.reason",
  "Restricted",
  "Listing unavailable",
  "Write your message…",
  "Forbidden"
];

for (const snippet of forbiddenEverywhere) {
  if (apiBundle.includes(snippet) || uiBundle.includes(snippet)) {
    fail("Forbidden unsafe messaging snippet remains: " + snippet);
  } else {
    pass("Forbidden unsafe messaging snippet absent: " + snippet);
  }
}

const forbiddenApiOnly = [
  "gate.reason",
  "error: gate.reason"
];

for (const snippet of forbiddenApiOnly) {
  if (apiBundle.includes(snippet)) {
    fail("Forbidden unsafe messaging API snippet remains: " + snippet);
  } else {
    pass("Forbidden unsafe messaging API snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[MESSAGE-01] Safe messaging boundaries check completed.");
