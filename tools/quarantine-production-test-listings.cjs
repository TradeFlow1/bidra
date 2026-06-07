const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apply = String(process.env.APPLY_TEST_LISTING_QUARANTINE || "").trim() === "1";
const imageNeedles = ["bidra-test.vercel-storage.com", "e2e-test-listing.jpg"];
function lower(value) {
  return String(value || "").toLowerCase();
}
function hasBadImage(listing) {
  const blob = [(listing.images || []).join(" "), (listing.photos || []).join(" ")].join(" ").toLowerCase();
  return imageNeedles.some(function (needle) { return blob.indexOf(needle) !== -1; });
}
function isObviousTestListing(listing) {
  const title = lower(listing.title);
  const email = lower(listing.seller && listing.seller.email);
  const titleLooksTest = title.indexOf("e2e logic ") === 0 || title.indexOf("e2e browser ") === 0 || title.indexOf("playwright test listing") === 0;
  const sellerLooksTest = email.indexOf("+bidra-test") !== -1;
  return sellerLooksTest && titleLooksTest && hasBadImage(listing);
}
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not loaded.");
  }
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      images: true,
      photos: true,
      createdAt: true,
      seller: { select: { email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 1000
  });
  const matches = listings.filter(isObviousTestListing);
  const visibleMatches = matches.filter(function (listing) { return listing.status !== "DELETED"; });
  const summary = {
    apply: apply,
    checkedListings: listings.length,
    matchedObviousTestListings: matches.length,
    visibleMatchedListings: visibleMatches.length,
    idsToQuarantine: visibleMatches.map(function (listing) { return listing.id; }),
    listings: visibleMatches.map(function (listing) {
      return {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        sellerEmail: listing.seller ? listing.seller.email : null,
        images: listing.images,
        photos: listing.photos,
        createdAt: listing.createdAt
      };
    })
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!apply) {
    console.log("DRY RUN ONLY. Set APPLY_TEST_LISTING_QUARANTINE=1 to apply.");
    return;
  }
  for (const listing of visibleMatches) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: "DELETED",
        images: [],
        photos: []
      }
    });
  }
  console.log("APPLIED quarantine to " + visibleMatches.length + " listings.");
}
main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
}).finally(async function () {
  await prisma.$disconnect();
});
