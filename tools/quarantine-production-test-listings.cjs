const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const apply = String(process.env.APPLY_TEST_LISTING_QUARANTINE || "").trim() === "1";

function lower(value) {
  return String(value || "").toLowerCase();
}

function isKnownTestSellerEmail(email) {
  const text = lower(email);
  return (
    text.indexOf("+bidra-test") !== -1 ||
    text.indexOf("playwright") !== -1 ||
    text.indexOf("e2e") !== -1
  );
}

function hasKnownTestTitle(title) {
  const text = lower(title);
  return (
    text.indexOf("e2e logic ") === 0 ||
    text.indexOf("e2e browser ") === 0 ||
    text.indexOf("playwright test listing") === 0 ||
    text.indexOf("test listing") !== -1 ||
    text.indexOf("qa test listing") !== -1
  );
}

function hasKnownTestAsset(listing) {
  const blob = [
    (listing.images || []).join(" "),
    (listing.photos || []).join(" ")
  ].join(" ").toLowerCase();

  return (
    blob.indexOf("bidra-test.vercel-storage.com") !== -1 ||
    blob.indexOf("e2e-test-listing.jpg") !== -1 ||
    blob.indexOf("/bidra-logo.png") !== -1
  );
}

function isObviousTestListing(listing) {
  const titleLooksTest = hasKnownTestTitle(listing.title);
  const sellerLooksTest = isKnownTestSellerEmail(listing.seller && listing.seller.email);
  const assetLooksTest = hasKnownTestAsset(listing);

  return (
    sellerLooksTest && titleLooksTest ||
    sellerLooksTest && assetLooksTest ||
    titleLooksTest && assetLooksTest
  );
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
  const visibleMatches = matches.filter(function (listing) {
    return listing.status !== "DELETED";
  });

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