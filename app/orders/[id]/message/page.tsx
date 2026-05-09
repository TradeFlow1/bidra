import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderMessageRedirectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const orderId = String(params?.id || "").trim();

  if (!session?.user?.id) {
    redirect(`/auth/login?next=${encodeURIComponent(`/orders/${orderId}/message`)}`);
  }

  const gate = await requireAdult(session);
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/dashboard");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      buyerId: true,
      listingId: true,
      listing: { select: { sellerId: true } },
    },
  });

  if (!order) redirect("/orders");

  const me = session.user.id;
  const sellerId = order.listing?.sellerId || "";
  if (me !== order.buyerId && me !== sellerId) redirect("/orders");

  const buyerId = order.buyerId;
  const thread = await prisma.messageThread.upsert({
    where: { listingId_buyerId: { listingId: order.listingId, buyerId } },
    update: { updatedAt: new Date(), buyerDeletedAt: null, sellerDeletedAt: null },
    create: {
      listingId: order.listingId,
      buyerId,
      sellerId,
      lastMessageAt: new Date(),
    },
    select: { id: true },
  });

  redirect(`/messages/${thread.id}`);
}
