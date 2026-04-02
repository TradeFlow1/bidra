import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getFeedbackGate } from "@/lib/feedback-gate";

export async function getNotificationCounts(userId: string) {
  // 1) Unread message threads (buyer + seller)
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
    // Fallback for Prisma versions that don't support fields.* in filters
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

  // 2) Feedback tasks (same gate used to block listing creation)
  const gate = await getFeedbackGate(userId, 48);
  const pendingFeedback = gate?.blocked ? Number(gate.pendingCount || 0) : 0;

  
  // 3) Orders requiring action
  const actionOrders = await prisma.order.count({
    where: {
      OR: [
        {
          buyerId: userId,
          status: "PICKUP_REQUIRED",
          pickupOptions: { not: Prisma.JsonNull },
        },
        {
          listing: { sellerId: userId },
          status: "PICKUP_REQUIRED",
        },
      ],
    },
  });

  const unreadThreadCount = Number(unreadThreads || 0);
const total = actionOrders + unreadThreadCount + pendingFeedback;

const hasCritical = actionOrders > 0 || pendingFeedback > 0;
const hasMessages = unreadThreadCount > 0;
const primaryType =
  pendingFeedback > 0 ? "feedback" :
  actionOrders > 0 ? "orders" :
  unreadThreadCount > 0 ? "messages" :
  "none";

return {
  total,
  unreadThreads: unreadThreadCount,
  pendingFeedback,
  actionOrders,
  hasCritical,
  hasMessages,
  primaryType,
};
}


