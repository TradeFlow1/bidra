import { prisma } from "@/lib/prisma";
import { getFeedbackGate } from "@/lib/feedback-gate";

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

  const watchedListings = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      createdAt: true,
      listing: {
        select: {
          id: true,
          status: true,
          updatedAt: true,
          currentOfferAmount: true,
          questions: {
            where: { deletedAt: null },
            select: { id: true, createdAt: true, answers: { where: { deletedAt: null }, select: { id: true, createdAt: true } } },
            take: 20,
          },
        },
      },
    },
  }).catch(() => []);

  let watchedChanged = 0;
  let watchedSold = 0;
  let watchedWithOffers = 0;
  let watchedWithQuestions = 0;

  for (const item of watchedListings) {
    const listing = item.listing;
    if (!listing) continue;
    if (listing.status === "SOLD") watchedSold++;
    if (typeof listing.currentOfferAmount === "number" && listing.currentOfferAmount > 0) watchedWithOffers++;

    const hasQuestionActivity = listing.questions.some((question) => {
      if (question.createdAt.getTime() > item.createdAt.getTime()) return true;
      return question.answers.some((answer) => answer.createdAt.getTime() > item.createdAt.getTime());
    });

    if (hasQuestionActivity) watchedWithQuestions++;

    if (
      listing.updatedAt.getTime() > item.createdAt.getTime() ||
      listing.status === "SOLD" ||
      (typeof listing.currentOfferAmount === "number" && listing.currentOfferAmount > 0) ||
      hasQuestionActivity
    ) {
      watchedChanged++;
    }
  }

  const unreadThreadCount = Number(unreadThreads || 0);
  const orderCount = Number(soldOrders || 0);
  const watchlistUpdates = Number(watchedChanged || 0);
  const total = unreadThreadCount + pendingFeedback + watchlistUpdates;

  const hasCritical = pendingFeedback > 0;
  const hasMessages = unreadThreadCount > 0;
  const hasWatchlistUpdates = watchlistUpdates > 0;
  const primaryType =
    pendingFeedback > 0 ? "feedback" :
    unreadThreadCount > 0 ? "messages" :
    watchlistUpdates > 0 ? "watchlist" :
    "none";

  return {
    total,
    unreadThreads: unreadThreadCount,
    pendingFeedback,
    actionOrders: orderCount,
    watchlistUpdates,
    watchedSold,
    watchedWithOffers,
    watchedWithQuestions,
    hasCritical,
    hasMessages,
    hasWatchlistUpdates,
    primaryType,
  };
}
export function getNotificationChannelSummary() {
  return {
    inAppCounts: true,
    emailWhenConfigured: true,
    webPush: false,
    nativeMobilePush: false,
    serviceWorkerPush: false,
    firebaseCloudMessaging: false,
    applePushNotifications: false,
    backgroundDeliveryGuarantee: false,
    summary: "Bidra currently uses in-app counts and email notifications where configured. Push notifications are not active yet.",
  };
}
