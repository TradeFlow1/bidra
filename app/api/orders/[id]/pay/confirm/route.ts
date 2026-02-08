import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client"
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const gate = await requireAdult(session);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: String(gate?.reason || "Not allowed") }, { status: gate?.status || 403 });
  }

  const orderId = String(params?.id || "").trim();
  if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });


  // Bidra V2: payment confirmation is blocked until pickup is scheduled.
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Idempotency: if already paid, return OK.
  if (order.status === OrderStatus.PAID) {
    return NextResponse.json({ ok: true, status: OrderStatus.PAID })
  }
  if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
    return NextResponse.json({ error: "Pickup must be scheduled before payment can be confirmed" }, { status: 409 })
  }
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

  // Buyer-only confirmation
  if (order.buyerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Only the buyer can confirm payment." }, { status: 403 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // Safety: if a listing somehow remained ACTIVE even though an order exists, force it to SOLD.
    // This is idempotent and only affects listings tied to this order.
    if (order?.listingId) {
      await tx.listing.updateMany({
        where: { id: order.listingId, status: "ACTIVE" },
        data: { status: "SOLD" },
      });
    }
    // Audit log: buyer confirmed Osko/PayID payment
    await tx.adminEvent.create({
      data: {
        type: "ORDER_PAY_CONFIRMED",
        userId: user.id,
        orderId: order.id,
        data: {
          listingId: order.listingId,
          buyerId: order.buyerId,
          sellerId: order.listing?.sellerId,
          prevStatus: order.status,
          newStatus: "PAID",
        },
      },
    });
  });

  return NextResponse.json({ ok: true, status: "PAID" });
}

