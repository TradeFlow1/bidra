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

const page = read("app/listings/[id]/page.tsx");

assert(page.includes('export const dynamic = "force-dynamic";'), "listing detail is dynamic");
assert(page.includes('photos: true'), "listing detail selects photos");
assert(page.includes('function isSafeImageUrl'), "listing detail validates image URLs");
assert(page.includes('function safeListingImages(...values: unknown[])'), "listing image helper accepts multiple sources");
assert(page.includes('safeListingImages(listing.images, listing.photos)'), "main gallery uses images and photos");
assert(page.includes('safeListingImages(item.images, item.photos)'), "related listings use images and photos");
assert(page.includes('Listing view count update failed'), "view count update cannot kill listing page");
assert(page.includes('unoptimized'), "detail page avoids remote image optimizer crashes");

if (process.exitCode) {
  process.exit(process.exitCode);
}
