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

  // We treat "overdue feedback" as: a completed trade (completedAt set) where feedback is still missing past the grace window. We apply a soft gate (not bans) to protect trust.
  const pendingCount = await prisma.order.count({
    where: {
      completedAt: { not: null, lt: cutoff },
      OR: [
        { buyerId: userId, buyerFeedbackAt: null },
      ],
    },
  });

  const first = pendingCount
    ? await prisma.order.findFirst({
        where: {
      completedAt: { not: null, lt: cutoff },
          OR: [
        { buyerId: userId, buyerFeedbackAt: null },
      ],
        },
        orderBy: { completedAt: "asc" },
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
