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
        amount: true,
        status: true,
        outcome: true,
        createdAt: true,
        completedAt: true,
        buyerId: true,
        listingId: true,
        buyerFeedbackAt: true,
        sellerFeedbackAt: true,
        listing: { select: { sellerId: true, title: true, price: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const sellerId = (order.listing as any) ? String(((order.listing as any).sellerId) || "") : "";
    const buyerId = String(order.buyerId || "");
    const isBuyer = userId === buyerId;
    const isSeller = userId === sellerId;
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }

    const myFeedbackAt = isBuyer ? (order as any).buyerFeedbackAt : (order as any).sellerFeedbackAt;
    const otherFeedbackAt = isBuyer ? (order as any).sellerFeedbackAt : (order as any).buyerFeedbackAt;

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        amount: (order as any).amount ?? null,
        status: order.status,
        outcome: order.outcome,
        createdAt: (order as any).createdAt ?? null,
        completedAt: order.completedAt ?? null,
        listingId: order.listingId ?? null,
        buyerId: order.buyerId ?? null,
        listing: {
          id: order.listingId ?? null,
          title: (order.listing as any) ? ((order.listing as any).title ?? null) : null,
          price: (order.listing as any) ? ((order.listing as any).price ?? null) : null,
          sellerId: sellerId || null,
        },
      },
      viewer: { isBuyer, isSeller },
      feedback: {
        mySubmitted: !!myFeedbackAt,
        otherSubmitted: !!otherFeedbackAt,
        required: !(Boolean((order as any).buyerFeedbackAt) && Boolean((order as any).sellerFeedbackAt)),
      },
    });
  } catch (e: any) {
    console.error("order.get failed", e);
    return NextResponse.json({ ok: false, error: "Unable to load order." }, { status: 500 });
  }
}
