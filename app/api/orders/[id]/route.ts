import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const gate = requireAdult(session);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: { include: { seller: { select: { id: true, username: true, name: true } } } },
      buyer: { select: { id: true, username: true, name: true } },
      feedback: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isBuyer = order.buyerId === userId;
  const isSeller = order.listing?.sellerId === userId;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const myFeedbackAt = isBuyer ? order.buyerFeedbackAt : order.sellerFeedbackAt;
  const otherFeedbackAt = isBuyer ? order.sellerFeedbackAt : order.buyerFeedbackAt;

  return NextResponse.json({
    order: {
      id: order.id,
      amount: order.amount,
      status: order.status,
      outcome: order.outcome,
      createdAt: order.createdAt,
      buyerFeedbackAt: order.buyerFeedbackAt,
      sellerFeedbackAt: order.sellerFeedbackAt,
      completedAt: order.completedAt,
      listing: {
        id: order.listingId,
        title: order.listing?.title,
        sellerId: order.listing?.sellerId,
      },
      buyerId: order.buyerId,
    },
    viewer: { isBuyer, isSeller },
    feedback: {
      mySubmitted: !!myFeedbackAt,
      otherSubmitted: !!otherFeedbackAt,
      required: !(order.buyerFeedbackAt && order.sellerFeedbackAt),
    },
  });
}
