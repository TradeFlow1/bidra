import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const selectedAt = body ? body.selectedAt : null;

  if (!selectedAt || typeof selectedAt !== "string") {
    return NextResponse.json({ error: "Invalid selectedAt" }, { status: 400 });
  }

  const options = Array.isArray(order.pickupOptions) ? order.pickupOptions : [];
  const match = options.find((x) => String(x) === selectedAt);

  if (!match) {
    return NextResponse.json({ error: "Selected option is not valid" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupScheduledAt: new Date(selectedAt),
      pickupOptionSelectedAt: new Date(),
      pickupScheduleLockedAt: new Date(),
      status: "PICKUP_SCHEDULED",
    },
  });

  return NextResponse.json({ ok: true, order: updated });
}
