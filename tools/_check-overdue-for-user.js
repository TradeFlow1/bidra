const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userId = process.argv[2];
if (!userId) {
  console.log("Usage: node tools/_check-overdue-for-user.js <USER_ID>");
  process.exit(1);
}

(async () => {
  const cutoff = new Date(Date.now() - (48 * 60 * 60 * 1000));

  const pendingCount = await prisma.order.count({
    where: {
      completedAt: { not: null, lt: cutoff },
      OR: [
        { buyerId: userId, buyerFeedbackAt: null },
        { listing: { sellerId: userId }, sellerFeedbackAt: null },
      ],
    },
  });

  const first = pendingCount
    ? await prisma.order.findFirst({
        where: {
          completedAt: { not: null, lt: cutoff },
          OR: [
            { buyerId: userId, buyerFeedbackAt: null },
            { listing: { sellerId: userId }, sellerFeedbackAt: null },
          ],
        },
        orderBy: { completedAt: "asc" },
        select: { id: true },
      })
    : null;

  console.log("PENDING_OVERDUE_COUNT=" + pendingCount);
  console.log("FIRST_ORDER_ID=" + (first ? first.id : "null"));

  await prisma.$disconnect();
})();
