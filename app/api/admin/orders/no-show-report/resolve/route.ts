import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  const session = await auth();
  const gate = await requireAdult(session);
  if (!gate.ok) return NextResponse.redirect(new URL("/account/restrictions", req.url));

  const user = session?.user;
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));

  const form = await req.formData();
  const orderId = String(form.get("orderId") || "").trim();
  const decision = String(form.get("decision") || "").trim().toUpperCase();
  const note = String(form.get("note") || "").trim();
  const backTo = String(form.get("backTo") || "/admin/events");

  if (!orderId) return NextResponse.redirect(new URL(backTo, req.url));
  if (decision !== "REVIEWED_BUYER_AT_FAULT" && decision !== "REVIEWED_SELLER_AT_FAULT" && decision !== "REVIEWED_INCONCLUSIVE") {
    return NextResponse.redirect(new URL(backTo, req.url));
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });

  if (!order) return NextResponse.redirect(new URL(backTo, req.url));

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "ORDER_NO_SHOW_REPORT_REVIEW",
      entityType: "ORDER",
      entityId: order.id,
      listingId: order.listingId ?? null,
      userId: order.buyerId ?? null,
      meta: {
        decision: decision,
        note: note || null,
      },
    },
  });

  await prisma.adminEvent.create({
    data: {
      type: "ORDER_NO_SHOW_REPORT_REVIEWED",
      userId: user.id,
      orderId: order.id,
      data: {
        listingId: order.listingId ?? null,
        buyerId: order.buyerId ?? null,
        sellerId: order.listing?.sellerId ?? null,
        decision: decision,
        note: note || null,
      },
    },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
