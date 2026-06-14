const fs = require("fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
}

const page = read("app/listings/page.tsx");

assert(page.includes('const selectedLocation = explicitLocation || "";'), "browse location defaults to empty unless explicit");
assert(page.includes('const selectedState = explicitState || "";'), "browse state defaults to all Australia unless explicit");
assert(!page.includes('explicitLocation || profileLocation'), "browse does not apply profile location by default");
assert(!page.includes('explicitState || profileState'), "browse does not apply profile state by default");
assert(!page.includes('profile?.postcode'), "browse page has no stale profile postcode reference");
assert(!page.includes('profile?.state'), "browse page has no stale profile state reference");
assert(page.includes('Clear filters to search all Australia'), "empty state explains how to broaden results");
assert(page.includes('active listings across Australia'), "result count does not imply hidden local-only browse");
assert(page.includes('unoptimized'), "browse cards avoid remote image optimizer crashes");

if (process.exitCode) {
  process.exit(process.exitCode);
}
