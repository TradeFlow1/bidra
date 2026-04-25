import { prisma } from "@/lib/prisma";
import { getFeedbackGate } from "@/lib/feedback-gate";

// TODO(watchlist-notifications): When a persisted notification model exists,
// add watchlist event counts/hooks for:
// - watched listing ending soon
// - watched listing receiving a new offer
// - watched listing sold
// Keep this derived-count helper schema-free until that model is available.
export async function getNotificationCounts(userId: string) {
  const unreadThreads = await prisma.messageThread.count({
    where: {
      OR: [
        {
          buyerId: userId,
          lastMessageAt: { gt: prisma.messageThread.fields.buyerLastReadAt },
        },
        {
          sellerId: userId,
          lastMessageAt: { gt: prisma.messageThread.fields.sellerLastReadAt },
        },
      ],
    },
  }).catch(async () => {
    const threads = await prisma.messageThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      select: { buyerId: true, sellerId: true, lastMessageAt: true, buyerLastReadAt: true, sellerLastReadAt: true },
      take: 500,
      orderBy: { lastMessageAt: "desc" },
    });

    let c = 0;
    for (const t of threads) {
      const isBuyer = t.buyerId === userId;
      const readAt = isBuyer ? t.buyerLastReadAt : t.sellerLastReadAt;
      if (!readAt || readAt.getTime() < t.lastMessageAt.getTime()) c++;
    }
    return c;
  });

  const gate = await getFeedbackGate(userId, 48);
  const pendingFeedback = gate?.blocked ? Number(gate.pendingCount || 0) : 0;

  const soldOrders = await prisma.order.count({
    where: {
      OR: [
        { buyerId: userId },
        { listing: { sellerId: userId } },
      ],
    },
  });

  const unreadThreadCount = Number(unreadThreads || 0);
  const orderCount = Number(soldOrders || 0);
  const total = unreadThreadCount + pendingFeedback;

  const hasCritical = pendingFeedback > 0;
  const hasMessages = unreadThreadCount > 0;
  const primaryType =
    pendingFeedback > 0 ? "feedback" :
    unreadThreadCount > 0 ? "messages" :
    "none";

  return {
    total,
    unreadThreads: unreadThreadCount,
    pendingFeedback,
    actionOrders: orderCount,
    hasCritical,
    hasMessages,
    primaryType,
  };
}
