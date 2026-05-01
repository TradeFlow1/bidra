const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[WATCH-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[WATCH-01] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[WATCH-01] PASS: Found " + snippet);
  }
}

const detailButton = read("app/listings/[id]/watchlist-button.tsx");
const card = read("components/listing-card.tsx");
const watchlistPage = read("app/watchlist/page.tsx");
const toggleRoute = read("app/api/watchlist/toggle/route.ts");
const statusRoute = read("app/api/watchlist/status/route.ts");
const bundle = detailButton + "\n" + card + "\n" + watchlistPage + "\n" + toggleRoute + "\n" + statusRoute;

check(detailButton, "const [message, setMessage]");
check(detailButton, "Added to watchlist.");
check(detailButton, "Removed from watchlist.");
check(detailButton, "role=\"status\"");
check(detailButton, "aria-live=\"polite\"");
check(card, "initiallyWatched");
check(card, "setWatched(function (v) { return !v; });");
check(card, "Saving...");
check(card, "Saved");
check(card, "Save");
check(watchlistPage, "Your watchlist is empty");
check(watchlistPage, "Browse listings");
check(watchlistPage, "initiallyWatched={true}");
check(watchlistPage, "showWatchButton={true}");
check(toggleRoute, "return NextResponse.json({ ok: true, watched: false });");
check(toggleRoute, "return NextResponse.json({ ok: true, watched: true });");
check(statusRoute, "watched: !!existing");

for (const forbidden of ["window.confirm", "confirm(", "alert(", "prompt("]) {
  if (bundle.includes(forbidden)) {
    console.error("[WATCH-01] FAIL: Native dialog remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[WATCH-01] PASS: Native dialog absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[WATCH-01] Watchlist toggle and empty state check completed.");
