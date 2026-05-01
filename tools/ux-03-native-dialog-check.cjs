const fs = require("fs");
const path = require("path");
const repoRoot = path.resolve(__dirname, "..");
const roots = ["app", "components", "lib"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);
const forbidden = ["window.confirm", "confirm(", "window.alert", "alert(", "window.prompt", "prompt("];
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}
function fail(message) { console.error("[UX-03] FAIL: " + message); process.exitCode = 1; }
function pass(message) { console.log("[UX-03] PASS: " + message); }
for (const root of roots) {
  for (const file of walk(path.join(repoRoot, root))) {
    const rel = path.relative(repoRoot, file).replace(/\\\\/g, "/");
    const text = fs.readFileSync(file, "utf8");
    for (const token of forbidden) {
      if (text.includes(token)) fail(rel + " contains native dialog token " + token);
    }
  }
}
function check(relativePath, snippet) {
  const fullPath = path.join(repoRoot, relativePath);
  const text = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
  if (!text.includes(snippet)) fail("Missing " + snippet + " in " + relativePath);
  else pass("Found " + snippet + " in " + relativePath);
}
check("app/dashboard/delete-listing-button.tsx", "BdModal");
check("app/listings/[id]/delete-listing-button.tsx", "BdModal");
check("app/sell/edit/[id]/edit-listing-client.tsx", "title=\"End this listing?\"");
check("app/sell/edit/[id]/edit-listing-client.tsx", "title=\"Delete this listing?\"");
check("app/ft/feedback/page.tsx", "StatusMessage");
check("app/ft/report/page.tsx", "StatusMessage");
check("app/messages/[id]/components/thread-actions.tsx", "Type DELETE to confirm");
check("app/messages/[id]/components/thread-actions.tsx", "Briefly describe what happened");
if (process.exitCode) process.exit(process.exitCode);
console.log("[UX-03] Native dialog check completed.");
