const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const orderId = process.argv[2];
const fromUserId = process.argv[3];

if (!orderId || !fromUserId) {
  console.log("Usage: node tools/_check-feedback-exists.js <ORDER_ID> <FROM_USER_ID>");
  process.exit(1);
}

(async () => {
  const rows = await prisma.feedback.findMany({
    where: { orderId, fromUserId },
    select: { id: true, rating: true, comment: true, createdAt: true }
  });

  console.log("FEEDBACK_ROWS=" + rows.length);
  console.log(rows);

  await prisma.$disconnect();
})();
