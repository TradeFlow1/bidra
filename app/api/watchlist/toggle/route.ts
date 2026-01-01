import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    const body = await req.json().catch(() => ({}));
    const listingId = String(body.listingId || "").trim();
    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }

    const userId = session.user.id;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, listingId },
      select: { id: true },
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ watched: false });
    }

    await prisma.watchlist.create({
      data: { userId, listingId },
    });

    return NextResponse.json({ watched: true });
  } catch (e) {
    console.error("watchlist toggle error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
