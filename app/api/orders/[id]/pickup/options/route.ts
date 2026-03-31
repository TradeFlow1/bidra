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

  if (order.listing?.sellerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const options = body ? body.options : null;

  if (!options || !Array.isArray(options) || options.length === 0) {
    return NextResponse.json({ error: "Invalid options" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupOptions: options,
      pickupOptionsSentAt: new Date(),
      status: "PICKUP_REQUIRED",
    },
  });

  return NextResponse.json({ ok: true, order: updated });
}
