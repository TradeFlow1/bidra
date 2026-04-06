import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "PICKUP_REQUIRED" && order.status !== "PICKUP_SCHEDULED") {
    return NextResponse.json({ error: "Pickup selection is not available for this order status." }, { status: 409 });
  }

  const body = await req.json();
  const selectedAt = body ? body.selectedAt : null;

  if (!selectedAt || typeof selectedAt !== "string") {
    return NextResponse.json({ error: "Invalid selectedAt" }, { status: 400 });
  }

  const options = Array.isArray(order.pickupOptions) ? order.pickupOptions : [];
  const match = options.find((x) => String(x) === selectedAt);

  if (!match) {
    return NextResponse.json({ error: "Selected option is not valid" }, { status: 400 });
  }

  const isReschedulePending = !!order.rescheduleRequestedAt;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupScheduledAt: new Date(selectedAt),
      pickupOptionSelectedAt: new Date(),
      pickupScheduleLockedAt: new Date(),
      status: "PICKUP_SCHEDULED",
      rescheduleResolvedAt: isReschedulePending ? new Date() : order.rescheduleResolvedAt,
      rescheduleRequestedAt: isReschedulePending ? null : order.rescheduleRequestedAt,
      rescheduleRequestedByRole: isReschedulePending ? null : order.rescheduleRequestedByRole,
      rescheduleReason: isReschedulePending ? null : order.rescheduleReason,
      rescheduleCount: isReschedulePending ? { increment: 1 } : order.rescheduleCount,
    },
  });

  try {
    await prisma.adminEvent.create({
      data: {
        type: isReschedulePending ? "ORDER_RESCHEDULE_CONFIRMED" : "ORDER_PICKUP_OPTION_SELECTED",
        userId: String(user.id),
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: order.buyerId ?? null,
          sellerId: order.listing?.sellerId ?? null,
          selectedAt: selectedAt,
        },
      },
    });
  } catch (e) {
    console.warn("[ADMIN_AUDIT] Failed to log pickup selection", e);
  }

  if (order.listing?.sellerId) {
    const seller = await prisma.user.findUnique({ where: { id: order.listing.sellerId } });
    if (seller?.email) {
      await sendEmail({
        to: seller.email,
        subject: isReschedulePending ? "Replacement pickup time confirmed" : "Pickup time confirmed",
        text:
          (isReschedulePending
            ? "The buyer has selected a replacement pickup time.\n\nView details here:\n"
            : "The buyer has selected a pickup time.\n\nView details here:\n") +
          (process.env.NEXTAUTH_URL || "https://www.bidra.com.au") +
          "/orders/" + order.id
      });
    }
  }

  return NextResponse.json({ ok: true, order: updated });
}