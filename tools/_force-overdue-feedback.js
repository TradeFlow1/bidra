const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const id = process.argv[2];
if (!id) {
  console.log("Usage: node tools/_force-overdue-feedback.js <ORDER_ID>");
  process.exit(1);
}

(async () => {
  const back = new Date(Date.now() - (49 * 60 * 60 * 1000)); // 49h ago

  const updated = await prisma.order.update({
    where: { id },
    data: {
      completedAt: back,
      buyerFeedbackAt: null,
      // leave sellerFeedbackAt as-is (we're testing buyer)
    },
    select: { id: true, completedAt: true, buyerFeedbackAt: true, sellerFeedbackAt: true },
  });

  console.log("FORCED_OVERDUE_OK");
  console.log(updated);

  await prisma.$disconnect();
})();
