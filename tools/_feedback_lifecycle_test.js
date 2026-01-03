const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function hoursAgo(h) { return new Date(Date.now() - h * 60 * 60 * 1000); }

async function overdueCountForUser(userId) {
  const cutoff = hoursAgo(48);
  return prisma.order.count({
    where: {
      completedAt: { not: null, lt: cutoff },
      OR: [
        { buyerId: userId, buyerFeedbackAt: null },
        { listing: { sellerId: userId }, sellerFeedbackAt: null },
      ],
    },
  });
}

(async () => {
  const o = await prisma.order.findFirst({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      completedAt: true,
      listing: { select: { id: true, title: true, sellerId: true } },
    },
  });

  if (!o) { console.log("NO_COMPLETED_ORDER_FOUND"); process.exit(0); }

  const orderId = o.id;
  const buyerId = o.buyerId;
  const sellerId = o.listing.sellerId;

  console.log("USING_ORDER_ID=" + orderId);
  console.log("LISTING_ID=" + o.listing.id);
  console.log("BUYER_ID=" + buyerId);
  console.log("SELLER_ID=" + sellerId);

  // Arrange: wipe feedback + force overdue
  await prisma.feedback.deleteMany({ where: { orderId } });
  await prisma.order.update({
    where: { id: orderId },
    data: { completedAt: hoursAgo(49), buyerFeedbackAt: null, sellerFeedbackAt: null },
  });

  console.log("OVERDUE_COUNT_BEFORE buyer=" + await overdueCountForUser(buyerId) + " seller=" + await overdueCountForUser(sellerId));

  // Act: buyer feedback
  await prisma.feedback.create({
    data: { orderId, fromUserId: buyerId, toUserId: sellerId, role: "BUYER", rating: 5, comment: "test buyer feedback" },
  });
  await prisma.order.update({ where: { id: orderId }, data: { buyerFeedbackAt: new Date() } });

  console.log("OVERDUE_COUNT_AFTER_BUYER buyer=" + await overdueCountForUser(buyerId) + " seller=" + await overdueCountForUser(sellerId));

  // Act: seller feedback
  await prisma.feedback.create({
    data: { orderId, fromUserId: sellerId, toUserId: buyerId, role: "SELLER", rating: 4, comment: "test seller feedback" },
  });
  await prisma.order.update({ where: { id: orderId }, data: { sellerFeedbackAt: new Date() } });

  console.log("OVERDUE_COUNT_AFTER_SELLER buyer=" + await overdueCountForUser(buyerId) + " seller=" + await overdueCountForUser(sellerId));

  await prisma.$disconnect();
})();
