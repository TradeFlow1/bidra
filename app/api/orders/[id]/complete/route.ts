import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = String(params?.id || "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = gate.dbUser?.id || "";
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        outcome: true,
        completedAt: true,
        buyerId: true,
        listing: { select: { sellerId: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const sellerId = (order.listing as any)?.sellerId || null;
    if (!sellerId) return NextResponse.json({ ok: false, error: "Order listing is unavailable." }, { status: 409 });

    if (sellerId !== userId) {
      return NextResponse.json({ ok: false, error: "Only the seller can confirm payment received." }, { status: 403 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ ok: false, error: "Buyer has not confirmed payment yet." }, { status: 409 });
    }

    if (order.outcome === "COMPLETED") {
      return NextResponse.json({ ok: true, outcome: "COMPLETED" });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        outcome: "COMPLETED",
        completedAt: order.completedAt ?? new Date(),
      },
      select: { outcome: true, completedAt: true },
    });

    return NextResponse.json({ ok: true, outcome: updated.outcome, completedAt: updated.completedAt });
  } catch (e: any) {
    console.error("order.complete failed", e);
    return NextResponse.json({ ok: false, error: "Unable to confirm payment received." }, { status: 500 });
  }
}
