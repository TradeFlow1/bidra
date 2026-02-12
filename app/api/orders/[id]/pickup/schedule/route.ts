import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

type PickupWindow = {
  day: number; // 0=Sun .. 6=Sat
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

function parseHHmm(s: string): number {
  const m = /^([01]\\d|2[0-3]):([0-5]\\d)$/.exec(s);
  if (!m) return -1;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh * 60 + mm;
}

function isWithinWindows(date: Date, windows: PickupWindow[]): boolean {
  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();
  const todays = windows.filter((w) => w.day === day);
  for (const w of todays) {
    const start = parseHHmm(w.start);
    const end = parseHHmm(w.end);
    if (start < 0 || end < 0) continue;
    if (end <= start) continue;
    if (minutes >= start) {
      if (minutes <= end) return true;
    }
  }
  return false;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const id = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!id) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const scheduledAtRaw = body ? body.scheduledAt : null;
    if (!scheduledAtRaw || typeof scheduledAtRaw !== "string") {
      return NextResponse.json({ ok: false, error: "scheduledAt is required (ISO string)" }, { status: 400 });
    }

    const scheduledAt = new Date(scheduledAtRaw);
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ ok: false, error: "scheduledAt must be a valid ISO datetime string" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    // Buyer-only: buyer schedules pickup within seller windows
    if (String((order as any).buyerId || "") !== userId) {
      return NextResponse.json({ ok: false, error: "Only the buyer can schedule pickup." }, { status: 403 });
    }

    // Status guard: scheduling is only allowed when pickup is required (pre-schedule)
    if (order.status === OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "Pickup is already scheduled." }, { status: 409 });
    }
    if (order.status !== OrderStatus.PICKUP_REQUIRED) {
      return NextResponse.json({ ok: false, error: "Pickup scheduling is not available for this order status." }, { status: 409 });
    }

    const availability = (order.listing as any) ? (order.listing as any).pickupAvailability : null;
    if (!availability) {
      return NextResponse.json({ ok: false, error: "Seller has not set pickup availability windows yet." }, { status: 409 });
    }

    const windows = availability as PickupWindow[];
    if (!Array.isArray(windows) || windows.length === 0) {
      return NextResponse.json({ ok: false, error: "Seller pickup availability windows are invalid." }, { status: 409 });
    }

    if (!isWithinWindows(scheduledAt, windows)) {
      return NextResponse.json({ ok: false, error: "Selected pickup time is outside seller pickup windows" }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        pickupScheduledAt: scheduledAt,
        pickupScheduleLockedAt: (order as any).pickupScheduleLockedAt ? (order as any).pickupScheduleLockedAt : new Date(),
        status: OrderStatus.PICKUP_SCHEDULED,
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: (e && e.message) ? e.message : "Failed to schedule pickup" }, { status: 500 });
  }
}

