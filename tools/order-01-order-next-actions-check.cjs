const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[ORDER-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[ORDER-01] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[ORDER-01] PASS: Found " + snippet);
  }
}

const ordersPage = read("app/orders/page.tsx");
const orderDetail = read("app/orders/[id]/page.tsx");
const payPage = read("app/orders/[id]/pay/page.tsx");
const payNowPage = read("app/orders/[id]/pay-now/page.tsx");
const completePage = read("app/orders/[id]/complete/page.tsx");
const payConfirmRoute = read("app/api/orders/[id]/pay/confirm/route.ts");
const completeRoute = read("app/api/orders/[id]/complete/route.ts");
const bundle = ordersPage + "\n" + orderDetail + "\n" + payPage + "\n" + payNowPage + "\n" + completePage + "\n" + payConfirmRoute + "\n" + completeRoute;

check(orderDetail, "const primaryNextAction");
check(orderDetail, "const primaryNextHref");
check(orderDetail, "const primaryNextLabel");
check(orderDetail, "Next action");
check(orderDetail, "There is no in-app Pay now step in Bidra V1.");
check(orderDetail, "No dead-end Pay now or completion step is required.");
check(orderDetail, "Message seller");
check(orderDetail, "Message buyer");
check(orderDetail, "Review feedback options");
check(ordersPage, "const nextActionCopy");
check(ordersPage, "Next action: message to agree payment and handover.");
check(ordersPage, "Next action: leave feedback.");
check(ordersPage, "Next action: no action needed.");
check(payPage, 'redirect("/orders/" + id)');
check(payNowPage, 'redirect("/orders/" + id)');
check(completePage, 'redirect("/orders/" + id)');
check(payConfirmRoute, "paymentStepRemoved: true");
check(payConfirmRoute, "There is no in-app payment confirmation step in Bidra V1.");
check(completeRoute, "This legacy endpoint is retired.");

for (const forbidden of ["href={`/orders/${o.id}/pay`", "href={`/orders/${o.id}/pay-now`", "href={`/orders/${order.id}/pay`", "href={`/orders/${order.id}/pay-now`"]) {
  if (bundle.includes(forbidden)) {
    console.error("[ORDER-01] FAIL: Dead-end payment link remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[ORDER-01] PASS: Dead-end payment link absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[ORDER-01] Order next-action check completed.");
