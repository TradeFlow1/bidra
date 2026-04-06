import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus, Prisma } from "@prisma/client";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const body = await req.json().catch(function () { return {}; });
    const reasonCode = String(body && body.reasonCode ? body.reasonCode : "").trim().toUpperCase();
    const note = String(body && body.note ? body.note : "").trim();

    const allowed = ["RUNNING_LATE", "CANNOT_MAKE_TIME", "NEED_ANOTHER_DAY", "AVAILABILITY_CHANGED", "OTHER"];
    if (allowed.indexOf(reasonCode) < 0) {
      return NextResponse.json({ ok: false, error: "Choose a valid reschedule reason." }, { status: 400 });
    }

    const reasonText = note ? (reasonCode + ": " + note) : reasonCode;

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
      return NextResponse.json({ ok: false, error: "Reschedule requests are only available after pickup has been scheduled." }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        rescheduleRequestedAt: new Date(),
        rescheduleRequestedByRole: isBuyer ? "BUYER" : "SELLER",
        rescheduleReason: reasonText,
        rescheduleResolvedAt: null,
        pickupOptions: isSeller ? Prisma.DbNull : (order.pickupOptions as Prisma.InputJsonValue),
        pickupOptionsSentAt: isSeller ? null : order.pickupOptionsSentAt,
        pickupOptionSelectedAt: isSeller ? null : order.pickupOptionSelectedAt,
      },
    });

    await prisma.adminEvent.create({
      data: {
        type: "ORDER_RESCHEDULE_REQUESTED",
        userId: userId,
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: buyerId || null,
          sellerId: sellerId || null,
          requestedByRole: isBuyer ? "BUYER" : "SELLER",
          currentScheduledAt: order.pickupScheduledAt ?? null,
          reasonCode: reasonCode,
          reason: reasonText,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      order: updated,
      message: isBuyer
        ? "Reschedule request sent. The seller needs to post replacement pickup options. The current pickup time still applies until a new time is chosen."
        : "Reschedule request recorded. Post replacement pickup options now. The current pickup time still applies until the buyer chooses a new time."
    });
  } catch (e: any) {
    console.error("order.reschedule-request failed", e);
    return NextResponse.json({ ok: false, error: "Unable to record reschedule request." }, { status: 500 });
  }
}