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
        completedAt: true,
        buyerId: true,
        listingId: true,
        pickupScheduledAt: true,
        listing: { select: { sellerId: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const sellerId = (order.listing as any) ? String(((order.listing as any).sellerId) || "") : "";
    if (!sellerId) return NextResponse.json({ ok: false, error: "Order listing is unavailable." }, { status: 409 });

    // Seller-only: seller confirms pickup completed & payment received
    if (sellerId !== userId) {
      return NextResponse.json({ ok: false, error: "Only the seller can complete this order." }, { status: 403 });
    }

    // Idempotent: if already completed, return success
    if (order.outcome === "COMPLETED") {
      return NextResponse.json({ ok: true, outcome: "COMPLETED", completedAt: order.completedAt ?? null });
    }

    // Guard against invalid terminal outcomes
    if (order.outcome === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Order cannot be completed in its current state." }, { status: 409 });
    }

    // Must be pickup-scheduled before completing
    if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "Pickup must be scheduled before completing the order." }, { status: 409 });
    }
    if (!order.pickupScheduledAt) {
      return NextResponse.json({ ok: false, error: "Pickup time is missing for this order." }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { outcome: "COMPLETED", completedAt: new Date() },
      select: { outcome: true, completedAt: true },
    });

    // Audit log: seller completed order
    try {
      await prisma.adminEvent.create({
        data: {
          type: "ORDER_COMPLETED",
          userId: String(userId),
          orderId: order.id,
          data: {
            listingId: order.listingId ?? null,
            buyerId: order.buyerId ?? null,
            sellerId: sellerId,
            prevStatus: order.status ?? null,
            prevOutcome: order.outcome ?? null,
            newOutcome: "COMPLETED",
          },
        },
      });
    } catch (e) {
      console.warn("[ADMIN_AUDIT] Failed to log ORDER_COMPLETED", e);
    }

    return NextResponse.json({ ok: true, outcome: updated.outcome, completedAt: updated.completedAt });
  } catch (e: any) {
    console.error("order.complete failed", e);
    return NextResponse.json({ ok: false, error: "Unable to complete order." }, { status: 500 });
  }
}
