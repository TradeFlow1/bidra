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
    if (!content.includes(item.pattern)) throw new Error(file + " missing map/list anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("app/listings/map/page.tsx", [
  { pattern: "Map/list browsing", label: "map/list headline" },
  { pattern: "Browse listings by area", label: "map page title" },
  { pattern: "ListingsMapPanel", label: "map panel render" },
  { pattern: "latitude", label: "latitude selection" },
  { pattern: "longitude", label: "longitude selection" },
  { pattern: "payment, pickup, delivery or postage is arranged directly in Messages", label: "platform handover guidance" },
  { pattern: "status: \"ACTIVE\"", label: "active listing only" },
  { pattern: "orders: { none: {} }", label: "unsold listing only" }
]);

check("components/listings-map-panel.tsx", [
  { pattern: "Browse by area", label: "map panel title" },
  { pattern: "seller-provided listing location data", label: "location source guidance" },
  { pattern: "mapPointStyle", label: "pin placement helper" },
  { pattern: "No precise map pins yet", label: "no coordinate state" },
  { pattern: "Some results use text-only locations", label: "fallback location guidance" },
  { pattern: "List view", label: "list view link" }
]);

console.log("PASS Map/list browsing checks completed.");
