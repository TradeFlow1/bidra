import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request) {
  try {
    const session = await auth();
    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { listing: { sellerId: userId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        outcome: true,
        createdAt: true,
        buyerId: true,
        listingId: true,
        completedAt: true,
        listing: { select: { sellerId: true, title: true, price: true } },
      },
    });

    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    console.error("orders.list failed", e);
    return NextResponse.json({ ok: false, error: "Unable to load orders." }, { status: 500 });
  }
}
