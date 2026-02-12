import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
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
        pickupScheduleLockedAt: true,
        completedAt: true,
        listing: { select: { sellerId: true, title: true, price: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const sellerId = (order.listing as any) ? String(((order.listing as any).sellerId) || "") : "";
    const buyerId = String(order.buyerId || "");
    if (userId !== buyerId && userId !== sellerId) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }

    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    console.error("order.get failed", e);
    return NextResponse.json({ ok: false, error: "Unable to load order." }, { status: 500 });
  }
}

