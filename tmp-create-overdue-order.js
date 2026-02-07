/**
 * Creates 1 overdue order (3 days old) so feedback gating can be tested.
 * - outcome: PENDING
 * - buyerFeedbackAt: null
 * - sellerFeedbackAt: null
 */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true },
    });

    if (!users.length) {
      console.log("❌ No users found. Create an account first.");
      return;
    }

    const listing = await prisma.listing.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, price: true, sellerId: true },
    });

    if (!listing) {
      console.log("❌ No listings found. Create a listing first (as any user).");
      return;
    }

    // Pick a buyer (first user). If they happen to be the listing seller, that's still fine for gating.
    const buyer = users[0];

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listing.id,
        amount: typeof listing.price === "number" ? listing.price : 100,
        outcome: "PICKUP_REQUIRED",
        buyerFeedbackAt: null,
        sellerFeedbackAt: null,
        completedAt: null,
        createdAt: threeDaysAgo,
      },
      select: { id: true, buyerId: true, listingId: true, createdAt: true, outcome: true },
    });

    console.log("✅ OVERDUE ORDER CREATED");
    console.log("Buyer:", buyer.email || buyer.id);
    console.log("Listing:", listing.title, `(${listing.id})`);
    console.log("Order:", order);

    console.log("➡️ Test these:");
    console.log("1) /sell/new  (should BLOCK if logged in as this buyer)");
    console.log(`2) /orders/${order.id}/feedback  (feedback page)`);
  } catch (e) {
    console.error("❌ Script error:", e);
  } finally {
    // Ensure we always disconnect
    // eslint-disable-next-line no-undef
    await new PrismaClient().$disconnect().catch(() => {});
  }
}

main();