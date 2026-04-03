import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const body = await req.json().catch(function () { return {}; });
    const reason = String(body && body.reason ? body.reason : "").trim();
    if (reason.length < 8) {
      return NextResponse.json({ ok: false, error: "Please provide a short reason for the no-show report." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const buyerId = String(order.buyerId || "");
    const sellerId = String(order.listing && order.listing.sellerId ? order.listing.sellerId : "");
    const isBuyer = userId === buyerId;
    const isSeller = userId === sellerId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }

    if (order.outcome === "COMPLETED" || order.outcome === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Order cannot be changed in its current state." }, { status: 409 });
    }

    if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "No-show reports are only available after pickup has been scheduled." }, { status: 409 });
    }

    await prisma.adminEvent.create({
      data: {
        type: "ORDER_NO_SHOW_REPORTED",
        userId: userId,
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: buyerId || null,
          sellerId: sellerId || null,
          reportedByRole: isBuyer ? "BUYER" : "SELLER",
          scheduledAt: order.pickupScheduledAt ?? null,
          reason: reason,
        },
      },
    });

    return NextResponse.json({ ok: true, message: "No-show report recorded for admin review." });
  } catch (e: any) {
    console.error("order.no-show-report failed", e);
    return NextResponse.json({ ok: false, error: "Unable to record no-show report." }, { status: 500 });
  }
}
