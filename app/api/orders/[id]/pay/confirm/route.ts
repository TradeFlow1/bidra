import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

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

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  return NextResponse.json({ ok: true, status: "PAID" });
}
