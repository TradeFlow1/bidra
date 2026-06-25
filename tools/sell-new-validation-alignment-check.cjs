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
    if (!content.includes(item.pattern)) throw new Error(file + " missing sell-new validation anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("components/sell-new-quality-gate.tsx", [
  { pattern: "Listing quality gate", label: "quality gate label" },
  { pattern: "Description has at least 40 useful characters", label: "description length check" },
  { pattern: "condition, faults, marks, or working state", label: "condition signal check" },
  { pattern: "pickup, postage, delivery, or handover details", label: "handover signal check" },
  { pattern: "4000 Brisbane, QLD", label: "AU location format guidance" },
  { pattern: "event.preventDefault", label: "client submit block" },
  { pattern: "field-description", label: "existing description field binding" },
  { pattern: "field-location", label: "existing location field binding" }
]);

check("app/sell/new/page.tsx", [
  { pattern: "SellNewQualityGate", label: "quality gate render" },
  { pattern: "@/components/sell-new-quality-gate", label: "quality gate import" }
]);

check("app/api/listings/create/route.ts", [
  { pattern: "Description must include condition, inclusions or faults, and pickup/postage details.", label: "server quality length message" },
  { pattern: "Description must mention condition, faults, marks, or whether the item works.", label: "server condition quality message" },
  { pattern: "Description must include pickup, postage, delivery, or handover details.", label: "server handover quality message" },
  { pattern: "Invalid location. Use format like: 4000 Brisbane, QLD", label: "server location quality message" }
]);

console.log("PASS Sell-new validation alignment checks completed.");
