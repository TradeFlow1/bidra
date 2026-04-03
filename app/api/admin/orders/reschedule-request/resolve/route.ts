import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

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
  const scheduledAtRaw = String(form.get("scheduledAt") || "").trim();
  const note = String(form.get("note") || "").trim();
  const backTo = String(form.get("backTo") || "/admin/events");

  if (!orderId) return NextResponse.redirect(new URL(backTo, req.url));
  if (decision !== "APPROVE" && decision !== "REJECT") return NextResponse.redirect(new URL(backTo, req.url));

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });

  if (!order) return NextResponse.redirect(new URL(backTo, req.url));
  if (order.status !== OrderStatus.PICKUP_SCHEDULED) return NextResponse.redirect(new URL(backTo, req.url));

  let newScheduledAtIso: string | null = null;
  if (decision === "APPROVE") {
    if (!scheduledAtRaw) return NextResponse.redirect(new URL(backTo, req.url));
    const scheduledAt = new Date(scheduledAtRaw);
    if (isNaN(scheduledAt.getTime())) return NextResponse.redirect(new URL(backTo, req.url));

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pickupScheduledAt: scheduledAt,
        pickupScheduleLockedAt: new Date(),
      },
    });

    newScheduledAtIso = scheduledAt.toISOString();
  }

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: decision === "APPROVE" ? "ORDER_RESCHEDULE_REQUEST_APPROVE" : "ORDER_RESCHEDULE_REQUEST_REJECT",
      entityType: "ORDER",
      entityId: order.id,
      listingId: order.listingId ?? null,
      userId: order.buyerId ?? null,
      meta: {
        note: note || null,
        scheduledAt: newScheduledAtIso,
      },
    },
  });

  await prisma.adminEvent.create({
    data: {
      type: decision === "APPROVE" ? "ORDER_RESCHEDULE_REQUEST_APPROVED" : "ORDER_RESCHEDULE_REQUEST_REJECTED",
      userId: user.id,
      orderId: order.id,
      data: {
        listingId: order.listingId ?? null,
        buyerId: order.buyerId ?? null,
        sellerId: order.listing?.sellerId ?? null,
        decision: decision,
        scheduledAt: newScheduledAtIso,
        note: note || null,
      },
    },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
