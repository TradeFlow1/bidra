import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.listing?.sellerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const options = body ? body.options : null;

  if (!options || !Array.isArray(options) || options.length !== 3) {
    return NextResponse.json({ ok: false, error: "Provide exactly 3 pickup options." }, { status: 400 });
  }

  const normalized = options.map(function (v: unknown) { return String(v || "").trim(); });
  if (normalized.some(function (v: string) { return !v; })) {
    return NextResponse.json({ ok: false, error: "Pickup options cannot be blank." }, { status: 400 });
  }

  const unique = Array.from(new Set(normalized));
  if (unique.length !== 3) {
    return NextResponse.json({ ok: false, error: "Pickup options must be different." }, { status: 400 });
  }

  const times = unique.map(function (v: string) { return new Date(v).getTime(); });
  const now = Date.now();

  if (times.some(function (t: number) { return !Number.isFinite(t) || t <= now; })) {
    return NextResponse.json({ ok: false, error: "Pickup options must be in the future." }, { status: 400 });
  }

  const sorted = times.slice().sort(function (a: number, b: number) { return a - b; });
  for (let i = 1; i < sorted.length; i += 1) {
    if ((sorted[i] - sorted[i - 1]) < (60 * 60 * 1000)) {
      return NextResponse.json({ ok: false, error: "Leave at least 1 hour between pickup options." }, { status: 400 });
    }
  }

  const isReschedulePending = !!order.rescheduleRequestedAt;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupOptions: unique,
      pickupOptionsSentAt: new Date(),
      pickupOptionSelectedAt: isReschedulePending ? null : order.pickupOptionSelectedAt,
      status: isReschedulePending ? "PICKUP_SCHEDULED" : "PICKUP_REQUIRED",
    },
  });

  try {
    await prisma.adminEvent.create({
      data: {
        type: isReschedulePending ? "ORDER_RESCHEDULE_OPTIONS_POSTED" : "ORDER_PICKUP_OPTIONS_POSTED",
        userId: String(user.id),
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: order.buyerId ?? null,
          sellerId: order.listing?.sellerId ?? null,
          options: unique,
        },
      },
    });
  } catch (_auditErr) {}

  if (order.buyerId) {
    const buyer = await prisma.user.findUnique({ where: { id: order.buyerId } });
    if (buyer?.email) {
      await sendEmail({
        to: buyer.email,
        subject: isReschedulePending ? "Replacement pickup options available" : "Pickup options available",
        text:
          (isReschedulePending
            ? "The seller has posted replacement pickup options for your order.\n\nChoose a new time here:\n"
            : "The seller has provided pickup options for your order.\n\nChoose a time here:\n") +
          (process.env.NEXTAUTH_URL || "https://www.bidra.com.au") +
          "/orders/" + order.id
      });
    }
  }

  return NextResponse.json({ ok: true, order: updated });
}