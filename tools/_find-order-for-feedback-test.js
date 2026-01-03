const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const o = await prisma.order.findFirst({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      completedAt: true,
      buyerId: true,
      listing: { select: { sellerId: true } }
    }
  });

  if (!o) {
    console.log("NO_COMPLETED_ORDER_FOUND");
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log("ORDER_ID=" + o.id);
  console.log("COMPLETED_AT=" + o.completedAt.toISOString());
  console.log("BUYER_ID=" + o.buyerId);
  console.log("SELLER_ID=" + o.listing.sellerId);

  await prisma.$disconnect();
})();
