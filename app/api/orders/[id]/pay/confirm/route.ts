import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const gate = await requireAdult(session as any);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: String((gate as any)?.reason || "Not allowed") }, { status: (gate as any)?.status || 403 });
  }

  const orderId = String(params?.id || "").trim();
  if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

  // Buyer-only confirmation
  if (order.buyerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Only the buyer can confirm payment." }, { status: 403 });
  }

  if (order.status === "PAID") return NextResponse.json({ ok: true, status: "PAID" });

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
  });

  return NextResponse.json({ ok: true, status: "PAID" });
}
