const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const id = process.argv[2];
if (!id) {
  console.log("Usage: node tools/_inspect-order-and-block.js <ORDER_ID>");
  process.exit(1);
}

(async () => {
  const o = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      completedAt: true,
      listing: { select: { id: true, title: true, sellerId: true } },
    },
  });

  if (!o) {
    console.log("ORDER_NOT_FOUND");
    await prisma.$disconnect();
    process.exit(0);
  }

  const buyer = await prisma.user.findUnique({
    where: { id: o.buyerId },
    select: { id: true, policyStrikes: true, policyBlockedUntil: true },
  });

  const seller = await prisma.user.findUnique({
    where: { id: o.listing.sellerId },
    select: { id: true, policyStrikes: true, policyBlockedUntil: true },
  });

  console.log({ order: o, buyer, seller });
  await prisma.$disconnect();
})();
