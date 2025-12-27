const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    const listing = await p.listing.findFirst({ orderBy: { createdAt: "desc" } });
    if (!listing) throw new Error("No listings found to attach order to.");

    const buyer = await p.user.findFirst({ where: { role: "USER" }, orderBy: { createdAt: "desc" } });
    if (!buyer) throw new Error("No USER found to act as buyer.");

    const order = await p.order.create({
      data: {
        amount: listing.price,
        status: "PENDING",
        buyerId: buyer.id,
        listingId: listing.id,
        outcome: "PENDING",
      },
      select: { id: true, buyerId: true, listingId: true, amount: true, outcome: true, createdAt: true },
    });

    console.log("✅ TEST ORDER CREATED:", order);
    console.log("➡️ Feedback URL:", `/orders/${order.id}/feedback`);
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
