const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[OFFER-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[OFFER-02] PASS: " + message);
}

function fail(message) {
  console.error("[OFFER-02] FAIL: " + message);
  process.exitCode = 1;
}

const files = {
  acceptApi: read("app/api/listings/[id]/accept-highest-offer/route.ts"),
  buyNowApi: read("app/api/listings/[id]/buy-now/route.ts"),
  listingPage: read("app/listings/[id]/page.tsx"),
  acceptButton: read("app/listings/[id]/accept-highest-offer-button.tsx"),
  buyNowButton: read("app/listings/[id]/buy-now-button.tsx"),
  ordersPage: read("app/orders/page.tsx"),
  orderDetail: read("app/orders/[id]/page.tsx")
};

const bundle = Object.values(files).join("\n");
const apiBundle = files.acceptApi + "\n" + files.buyNowApi;
const uiBundle = files.listingPage + "\n" + files.acceptButton + "\n" + files.buyNowButton + "\n" + files.ordersPage + "\n" + files.orderDetail;

const required = [
  'nextStep: "Order created. Keep payment, pickup, postage, and handover arrangements in Bidra Messages."',
  "reusedExistingOrder",
  "Sign in required before using Buy Now.",
  "Your account is not eligible to use Buy Now.",
  "Listing id is required before using Buy Now.",
  "Buy Now is only available on active listings.",
  "Buy Now is no longer available for this listing.",
  "We could not create the order. Please try again.",
  "Sold - order record created.",
  "This listing is no longer available. The buyer and seller should keep payment, pickup, postage, and handover details in Bidra Messages.",
  "Buy Now creates a Bidra order record and redirects you to order details. Keep payment, pickup, postage, and handover arrangements in Messages.",
  "Accepting the highest offer creates a pending order record, marks the listing as sold, and opens order details for next steps.",
  "Accept highest offer and create order",
  "This creates a pending order record and redirects to order details. Keep payment, pickup, postage, and handover arrangements in Bidra Messages.",
  "Order created. Open Orders to continue in Bidra Messages.",
  "Sold-item records for your buys and sales. Open any order to message the other person and confirm payment, pickup, postage, and handover details.",
  "Order records",
  "Pending and completed sold-item records.",
  "Confirm payment and handover in Messages",
  "SOLD - HANDOVER PENDING",
  "This sold-item record confirms the listing has sold. Use Bidra Messages to confirm payment, pickup, postage, and handover details before completion.",
  "Use Bidra Messages to confirm payment, pickup, postage, and handover details.",
  "Post-sale next steps",
  "This order is a sold-item record while payment and handover are arranged.",
  "Use Bidra Messages to confirm payment, pickup, postage, and timing with the other person.",
  "Keep important agreements and handover details in Bidra Messages.",
  "Follow safety guidance before final handover or postage dispatch.",
  "Keep payment, pickup, postage, and important details in"
];

for (const snippet of required) {
  if (!bundle.includes(snippet)) {
    fail("Missing offer-order transition snippet: " + snippet);
  } else {
    pass("Found offer-order transition snippet: " + snippet);
  }
}

const forbiddenApi = [
  "Not authenticated",
  "adult.reason",
  "Restricted",
  "Missing listing id",
  "Listing is not active.",
  "Server error"
];

for (const snippet of forbiddenApi) {
  if (apiBundle.includes(snippet)) {
    fail("Forbidden unsafe transition API snippet remains: " + snippet);
  } else {
    pass("Forbidden unsafe transition API snippet absent: " + snippet);
  }
}

const forbiddenUi = [
  "This listing has been completed. Browse similar active listings below.",
  "This sold-item record confirms the listing has sold. Use messages to arrange pickup or postage.",
  "This order is a sold-item record for the completed sale.",
  "Use messages to arrange pickup or postage with the other person.",
  "Keep important agreements and handover details in Bidra messages.",
  "What happens now",
  "Arrange pickup or postage"
];

for (const snippet of forbiddenUi) {
  if (uiBundle.includes(snippet)) {
    fail("Forbidden weak transition UI snippet remains: " + snippet);
  } else {
    pass("Forbidden weak transition UI snippet absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[OFFER-02] Offer order transition check completed.");
