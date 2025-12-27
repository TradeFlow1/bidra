const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    const orders = await p.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        listingId: true,
        buyerId: true,
        createdAt: true,
        outcome: true,
        buyerFeedbackAt: true,
        sellerFeedbackAt: true,
        completedAt: true,
      },
    });

    console.log("ORDERS:", orders);
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error("ERR:", e.code, e.message);
  process.exit(1);
});
