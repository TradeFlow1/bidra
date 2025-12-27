import { prisma } from "@/lib/prisma";

export type FeedbackGateResult = {
  blocked: boolean;
  pendingCount: number;
  orderId: string | null;
  feedbackUrl: string | null;
  graceHours: number;
};

export async function getFeedbackGate(
  userId: string,
  graceHours: number = 48
): Promise<FeedbackGateResult> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - graceHours * 60 * 60 * 1000);

  // We treat "PENDING" as: sale occurred / needs feedback before being marked completed.
  // Block listing creation only when feedback is overdue (past grace window).
  const pendingCount = await prisma.order.count({
    where: {
      outcome: "PENDING",
      createdAt: { lt: cutoff },
      OR: [
        { buyerId: userId, buyerFeedbackAt: null },
        { listing: { sellerId: userId }, sellerFeedbackAt: null },
      ],
    },
  });

  const first = pendingCount
    ? await prisma.order.findFirst({
        where: {
          outcome: "PENDING",
          createdAt: { lt: cutoff },
          OR: [
            { buyerId: userId, buyerFeedbackAt: null },
            { listing: { sellerId: userId }, sellerFeedbackAt: null },
          ],
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })
    : null;

  return {
    blocked: pendingCount > 0,
    pendingCount,
    orderId: first?.id ?? null,
    feedbackUrl: first?.id ? `/orders/${first.id}/feedback` : null,
    graceHours,
  };
}