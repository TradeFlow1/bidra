const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ORDER-02] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[ORDER-02] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[ORDER-02] PASS: Found " + snippet + " in " + file);
  }
}

const orderDetail = read("app/orders/[id]/page.tsx");
const feedbackPage = read("app/orders/[id]/feedback/page.tsx");
const feedbackApi = read("app/api/feedback/submit/route.ts");
const completeRoute = read("app/api/orders/[id]/complete/route.ts");
const completePage = read("app/orders/[id]/complete/page.tsx");
const payPage = read("app/orders/[id]/pay/page.tsx");
const payNowPage = read("app/orders/[id]/pay-now/page.tsx");
const bundle = orderDetail + "\n" + feedbackPage + "\n" + feedbackApi + "\n" + completeRoute + "\n" + completePage + "\n" + payPage + "\n" + payNowPage;

check("app/api/orders/[id]/complete/route.ts", "This legacy endpoint is retired.");
check("app/api/orders/[id]/complete/route.ts", "{ status: 410 }");
check("app/orders/[id]/complete/page.tsx", 'redirect("/orders/" + id)');
check("app/api/feedback/submit/route.ts", "ORDER-02: post-sale feedback is intentionally gated");
check("app/api/feedback/submit/route.ts", "if (!isBuyer && !isSeller)");
check("app/api/feedback/submit/route.ts", 'order.outcome !== "COMPLETED"');
check("app/api/feedback/submit/route.ts", "sold-item record is completed");
check("app/api/feedback/submit/route.ts", "alreadySubmitted: true");
check("app/orders/[id]/feedback/page.tsx", 'const canSubmit = order.outcome === "COMPLETED" && !alreadySubmitted;');
check("app/orders/[id]/feedback/page.tsx", "Feedback not open yet");
check("app/orders/[id]/feedback/page.tsx", "completionRequiredCopy");
check("app/orders/[id]/page.tsx", 'const canLeave =');
check("app/orders/[id]/page.tsx", 'order.outcome === "COMPLETED" &&');
check("app/orders/[id]/page.tsx", "No dead-end Pay now or completion step is required.");
check("app/orders/[id]/page.tsx", "Handover safety checkpoint");

for (const forbidden of [
  "href={`/orders/${order.id}/complete`",
  "href={`/orders/${order.id}/pay`",
  "href={`/orders/${order.id}/pay-now`"
]) {
  if (bundle.includes(forbidden)) {
    console.error("[ORDER-02] FAIL: Forbidden post-sale flow drift remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[ORDER-02] PASS: Forbidden post-sale flow drift absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[ORDER-02] Post-sale completion integrity check completed.");
