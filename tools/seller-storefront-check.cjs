const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error("Missing required file: " + relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, expectations) {
  const content = read(file);
  for (const item of expectations) {
    if (!content.includes(item.pattern)) throw new Error(file + " missing seller storefront anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("app/seller/[id]/page.tsx", [
  { pattern: "Seller storefront", label: "storefront headline label" },
  { pattern: "storefront on Bidra", label: "storefront metadata" },
  { pattern: "avatarUrl", label: "seller avatar support" },
  { pattern: "bio", label: "seller bio support" },
  { pattern: "badgeFastResponder", label: "seller badge support" },
  { pattern: "Storefront listings", label: "storefront listing section" },
  { pattern: "Payment, pickup, delivery or postage is arranged directly in Bidra Messages", label: "platform handover guidance" },
  { pattern: "viewCount", label: "listing activity stat" },
  { pattern: "watchlist", label: "saved listing stat" },
  { pattern: "Seller feedback", label: "feedback section" }
]);

console.log("PASS Seller storefront checks completed.");
