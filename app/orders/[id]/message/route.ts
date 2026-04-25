import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : "";

  if (!userId) {
    redirect(`/auth/login?next=/orders/${encodeURIComponent(String(ctx.params.id || ""))}`);
  }

  const adult = await requireAdult(session);
  if (!adult.ok) redirect("/account/restrictions");

  const orderId = String(ctx.params.id || "").trim();
  if (!orderId) redirect("/orders");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      buyerId: true,
      listingId: true,
      listing: { select: { id: true, sellerId: true, status: true } },
    },
  });

  if (!order || !order.listing) redirect("/orders");

  const buyerId = String(order.buyerId || "");
  const sellerId = String(order.listing.sellerId || "");
  const isBuyer = userId === buyerId;
  const isSeller = userId === sellerId;

  if (!isBuyer && !isSeller) redirect("/orders");

  const existing = await prisma.messageThread.findUnique({
    where: { listingId_buyerId: { listingId: order.listingId, buyerId: buyerId } },
    select: { id: true, buyerDeletedAt: true, sellerDeletedAt: true },
  });

  const thread = await prisma.messageThread.upsert({
    where: { listingId_buyerId: { listingId: order.listingId, buyerId: buyerId } },
    update: isBuyer
      ? { updatedAt: new Date(), buyerDeletedAt: null }
      : { updatedAt: new Date(), sellerDeletedAt: null },
    create: {
      listingId: order.listingId,
      buyerId: buyerId,
      sellerId: sellerId,
      lastMessageAt: new Date(),
    },
    select: { id: true },
  });

  try {
    await prisma.adminEvent.create({
      data: {
        type: existing ? "ORDER_MESSAGE_THREAD_OPENED" : "ORDER_MESSAGE_THREAD_CREATED",
        userId: userId,
        orderId: order.id,
        data: {
          listingId: order.listingId,
          threadId: thread.id,
          sellerId: sellerId,
          buyerId: buyerId,
          openedByRole: isBuyer ? "BUYER" : "SELLER",
          reopened: !!(existing && ((isBuyer && existing.buyerDeletedAt) || (isSeller && existing.sellerDeletedAt))),
        },
      },
    });
  } catch (_e) {}

  redirect(`/messages/${thread.id}`);
}
