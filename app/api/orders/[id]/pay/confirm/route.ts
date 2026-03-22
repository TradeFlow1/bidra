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

    if (String(order.buyerId || "") !== userId) {
      return NextResponse.json({ ok: false, error: "Only the buyer can confirm this step." }, { status: 403 });
    }

    if (order.outcome === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Order cannot be confirmed in its current state." }, { status: 409 });
    }

    if (order.outcome === "COMPLETED") {
      return NextResponse.json({ ok: true, status: String(order.status), alreadyCompleted: true });
    }

    if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "Pickup must be scheduled before this step can be confirmed." }, { status: 409 });
    }

    if (!order.pickupScheduledAt) {
      return NextResponse.json({ ok: false, error: "Pickup time is missing for this order." }, { status: 409 });
    }

    try {
      await prisma.adminEvent.create({
        data: {
          type: "ORDER_PAYMENT_CONFIRM_BYPASSED_V2",
          userId: String(userId),
          orderId: order.id,
          data: {
            listingId: order.listingId ?? null,
            buyerId: order.buyerId ?? null,
            sellerId: order.listing ? String((order.listing as any).sellerId || "") : null,
            status: String(order.status),
            outcome: String(order.outcome),
          },
        },
      });
    } catch (e) {
      console.warn("[ADMIN_AUDIT] Failed to log ORDER_PAYMENT_CONFIRM_BYPASSED_V2", e);
    }

    return NextResponse.json({
      ok: true,
      status: String(order.status),
      v2NoPaymentStep: true,
      message: "No payment confirmation step is required in V2.",
    });
  } catch (e: any) {
    console.error("order.pay.confirm failed", e);
    return NextResponse.json({ ok: false, error: "Unable to confirm this step." }, { status: 500 });
  }
}