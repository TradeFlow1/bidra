import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        outcome: true,
        buyerId: true,
        listingId: true,
        pickupScheduledAt: true,
        listing: { select: { sellerId: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    // Buyer-only: buyer confirms payment has been made
    if (String(order.buyerId || "") !== userId) {
      return NextResponse.json({ ok: false, error: "Only the buyer can confirm payment." }, { status: 403 });
    }

    // Terminal outcome guard
    if (order.outcome === "CANCELLED" || order.outcome === "DISPUTED") {
      return NextResponse.json({ ok: false, error: "Order cannot be paid in its current state." }, { status: 409 });
    }

    // Idempotent
    if (order.status === OrderStatus.PAID) {
      return NextResponse.json({ ok: true, status: "PAID" });
    }

    // Only allow transition into PAID from PENDING
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ ok: false, error: "Payment confirmation is not available for this order status." }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
      },
      select: { status: true },
    });

    // Audit log: buyer confirmed payment
    try {
      await prisma.adminEvent.create({
        data: {
          type: "ORDER_PAID_CONFIRMED",
          userId: String(userId),
          orderId: order.id,
          data: {
            listingId: order.listingId ?? null,
            buyerId: order.buyerId ?? null,
            sellerId: (order.listing as any) ? String(((order.listing as any).sellerId) || "") : null,
            prevStatus: order.status ?? null,
            newStatus: "PAID",
          },
        },
      });
    } catch (e) {
      console.warn("[ADMIN_AUDIT] Failed to log ORDER_PAID_CONFIRMED", e);
    }

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (e: any) {
    console.error("order.pay.confirm failed", e);
    return NextResponse.json({ ok: false, error: "Unable to confirm payment." }, { status: 500 });
  }
}

