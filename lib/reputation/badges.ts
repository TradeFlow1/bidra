import { prisma } from "@/lib/prisma";

/**
 * Phase 3 reputation badges
 *
 * - New seller: account <= 14 days
 * - Consistent seller: >= 2 COMPLETED sales in last 30 days (derived via listing.sellerId)
 * - Fast responder: median response time <= 2 hours, based on seller replies to buyer messages (last 14 days), minimum 5 reply samples
 */
export async function recomputeUserBadges(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();

  // -----------------------------
  // Badge: New seller (<= 14 days)
  // -----------------------------
  const badgeNewSeller = now.getTime() - user.createdAt.getTime() <= 14 * 24 * 60 * 60 * 1000;

  // ---------------------------------------------------------
  // Badge: Consistent seller (>= 2 completed sales last 30d)
  // NOTE: Order has no sellerId, so we derive via listing.sellerId
  // ---------------------------------------------------------
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completedSales = await prisma.order.count({
    where: {
      outcome: "COMPLETED",
      completedAt: { gte: since30 },
      listing: {
        sellerId: userId,
      },
    },
  });

  const badgeConsistentSeller = completedSales >= 2;

  // ---------------------------------------------------------
  // Badge: Fast responder (median <= 2 hours, last 14d, >= 5)
  // We measure time between a buyer message and the next seller reply
  // within the same listing conversation.
  // ---------------------------------------------------------
  const since14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Pull recent messages for listings belonging to this seller
  const msgs = await prisma.message.findMany({
    where: {
      createdAt: { gte: since14 },
      listing: { sellerId: userId },
    },
    select: {
      id: true,
      listingId: true,
      userId: true,
      createdAt: true,
    },
    orderBy: [{ listingId: "asc" }, { createdAt: "asc" }],
    take: 5000,
  });

  // We need sellerId to classify sender role in each conversation
  // The seller is the listing.sellerId (userId param)
  const SELLER_ID = userId;

  // Build response deltas (ms) for buyer->seller reply pairs
  const deltas: number[] = [];
  let i = 0;
  while (i < msgs.length) {
    const listingId = msgs[i].listingId;

    // Walk messages within this listing
    let j = i;
    while (j < msgs.length && msgs[j].listingId === listingId) {
      const cur = msgs[j];

      // If this is a buyer message, find next seller message
      if (cur.userId !== SELLER_ID) {
        let k = j + 1;
        while (k < msgs.length && msgs[k].listingId === listingId) {
          const nxt = msgs[k];
          if (nxt.userId === SELLER_ID) {
            const ms = new Date(nxt.createdAt).getTime() - new Date(cur.createdAt).getTime();
            if (ms > 0 && ms <= 48 * 60 * 60 * 1000) {
              // cap to 48h so one abandoned thread doesn't poison badge
              deltas.push(ms);
            }
            break;
          }
          k++;
        }
      }

      j++;
    }

    i = j;
  }

  let badgeFastResponder = false;
  if (deltas.length >= 5) {
    deltas.sort((a, b) => a - b);
    const mid = Math.floor(deltas.length / 2);
    const median = deltas.length % 2 === 0 ? Math.round((deltas[mid - 1] + deltas[mid]) / 2) : deltas[mid];
    badgeFastResponder = median <= 2 * 60 * 60 * 1000; // <= 2 hours
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      badgeNewSeller,
      badgeConsistentSeller,
      badgeFastResponder,
    },
  });
}
