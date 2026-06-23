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
    if (!content.includes(item.pattern)) throw new Error(file + " missing bulk/photo anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("app/sell/bulk/page.tsx", [
  { pattern: "Bulk listing and photo improvements", label: "page label" },
  { pattern: "Prepare listings faster", label: "page headline" },
  { pattern: "BulkListingPhotoPlanner", label: "planner render" },
  { pattern: "/auth/login?next=/sell/bulk", label: "auth gate" },
  { pattern: "without adding payment, shipping, pickup scheduling or completion workflow", label: "platform model copy" }
]);

check("components/bulk-listing-photo-planner.tsx", [
  { pattern: "Bulk listing prep", label: "planner label" },
  { pattern: "Plan many listings before uploading", label: "planner headline" },
  { pattern: "max 10 photos", label: "photo cap validation" },
  { pattern: "This planner is browser-only", label: "no publish disclosure" },
  { pattern: "Confirm pickup, delivery or postage in Bidra Messages", label: "messages handover guidance" },
  { pattern: "rowStatus", label: "row readiness helper" }
]);

check("app/sell/new/page.tsx", [
  { pattern: "/sell/bulk", label: "bulk prep link" },
  { pattern: "Bulk/photo prep", label: "bulk prep CTA" }
]);

console.log("PASS Bulk listing/photo checks completed.");
