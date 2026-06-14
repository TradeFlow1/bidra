const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async function main() {
  const rows = await prisma.listing.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      type: true,
      price: true,
      buyNowPrice: true,
      images: true,
      photos: true,
      category: true,
      sellerId: true,
      viewCount: true,
      seller: { select: { id: true, username: true, name: true, avatarUrl: true } },
    },
  });

  console.dir(rows, { depth: 10 });
})()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
