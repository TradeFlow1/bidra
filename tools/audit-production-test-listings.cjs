const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const needles = [
  "e2e-test-listing.jpg",
  "bidra-test.vercel-storage.com",
  "e2e logic",
  "e2e seed",
  "e2e test",
  "test listing"
];
function hasNeedle(value) {
  const text = String(value || "").toLowerCase();
  return needles.some(function (needle) { return text.indexOf(needle) !== -1; });
}
async function main() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
      images: true,
      photos: true,
      createdAt: true,
      seller: { select: { id: true, email: true, username: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 500
  });
  const matches = listings.filter(function (listing) {
    const blob = [
      listing.title,
      listing.category,
      (listing.images || []).join(" "),
      (listing.photos || []).join(" "),
      listing.seller && listing.seller.email,
      listing.seller && listing.seller.username
    ].join("\n");
    return hasNeedle(blob);
  });
  console.log(JSON.stringify({
    checkedListings: listings.length,
    matchedListings: matches.length,
    matches: matches.map(function (listing) {
      return {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        category: listing.category,
        sellerEmail: listing.seller ? listing.seller.email : null,
        images: listing.images,
        photos: listing.photos,
        createdAt: listing.createdAt
      };
    })
  }, null, 2));
}
main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
}).finally(async function () {
  await prisma.$disconnect();
});
