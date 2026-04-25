import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });
    }

    const gate = await requireAdult();
    if (!gate.ok) {
      return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    }

    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        outcome: true,
        buyerId: true,
        listingId: true,
        listing: { select: { sellerId: true } }
      }
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }

    if (String(order.buyerId || "") !== userId) {
      return NextResponse.json({ ok: false, error: "Only the buyer can confirm this step." }, { status: 403 });
    }

    try {
      await prisma.adminEvent.create({
        data: {
          type: "ORDER_PAYMENT_CONFIRM_SKIPPED",
          userId: String(userId),
          orderId: order.id,
          data: {
            listingId: order.listingId ?? null,
            buyerId: order.buyerId ?? null,
            sellerId: order.listing ? String((order.listing as any).sellerId || "") : null,
            status: String(order.status),
            outcome: String(order.outcome)
          }
        }
      });
    } catch (e) {
      console.warn("[ADMIN_AUDIT] Failed to log ORDER_PAYMENT_CONFIRM_SKIPPED", e);
    }

    return NextResponse.json({
      ok: true,
      status: String(order.status),
      paymentStepRemoved: true,
      message: "There is no in-app payment confirmation step in Bidra V1. Use messages to arrange pickup or postage details."
    });
  } catch (e: any) {
    console.error("order.pay.confirm failed", e);
    return NextResponse.json({ ok: false, error: "Unable to confirm this step." }, { status: 500 });
  }
}
