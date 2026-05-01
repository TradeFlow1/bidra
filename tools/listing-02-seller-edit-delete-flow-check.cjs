const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[LISTING-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[LISTING-02] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[LISTING-02] PASS: Found " + snippet);
  }
}

const dashboard = read("app/dashboard/listings/page.tsx");
const button = read("components/delete-listing-button.tsx");
const deleteRoute = read("app/api/listings/[id]/delete/route.ts");
const editPage = read("app/sell/edit/[id]/page.tsx");
const bundle = dashboard + "\n" + button + "\n" + deleteRoute + "\n" + editPage;

check(dashboard, 'href={"/sell/edit/" + l.id}');
check(dashboard, '<DeleteListingButton listingId={String(l.id)}');
check(dashboard, 'Listing deleted successfully.');
check(button, '"use client";');
check(button, 'role="dialog"');
check(button, 'aria-modal="true"');
check(button, 'Delete this listing?');
check(button, 'Keep listing');
check(button, 'Deleting...');
check(button, 'router.push("/dashboard/listings?ok=deleted")');
check(deleteRoute, 'status: "DELETED"');

for (const forbidden of ["window.confirm", "confirm(", "alert(", "prompt("]) {
  if (bundle.includes(forbidden)) {
    console.error("[LISTING-02] FAIL: Native dialog remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[LISTING-02] PASS: Native dialog absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[LISTING-02] Seller edit/delete flow check completed.");
