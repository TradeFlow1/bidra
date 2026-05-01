const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[MESSAGE-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[MESSAGE-02] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[MESSAGE-02] PASS: Found " + snippet);
  }
}

const sendBox = read("app/messages/[id]/components/send-box.tsx");
const threadPage = read("app/messages/[id]/page.tsx");
const sendRoute = read("app/api/messages/thread/[id]/send/route.ts");
const bundle = sendBox + "\n" + threadPage + "\n" + sendRoute;

check(sendBox, 'type SendState = "idle" | "sending" | "sent" | "failed"');
check(sendBox, "const SEND_TIMEOUT_MS = 12000");
check(sendBox, "new AbortController()");
check(sendBox, "window.setTimeout");
check(sendBox, "signal: controller.signal");
check(sendBox, 'setSendState("sending")');
check(sendBox, 'setSendState("sent")');
check(sendBox, 'setSendState("failed")');
check(sendBox, "Message sent.");
check(sendBox, "Retry message");
check(sendBox, "role=\"status\"");
check(sendBox, "role=\"alert\"");
check(sendBox, "aria-live=\"polite\"");
check(threadPage, "{seenLastMyMessage ? \"Seen\" : \"Sent\"}");
check(sendRoute, "return NextResponse.json({ ok: true, message: msg });");

for (const forbidden of ["window.confirm", "confirm(", "alert(", "prompt("]) {
  if (bundle.includes(forbidden)) {
    console.error("[MESSAGE-02] FAIL: Native dialog remains in send flow: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[MESSAGE-02] PASS: Native dialog absent from send flow: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[MESSAGE-02] Message send state reliability check completed.");
