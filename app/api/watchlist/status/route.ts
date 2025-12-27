import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ watched: false });
    }

    const url = new URL(req.url);
    const listingId = String(url.searchParams.get("listingId") || "").trim();
    if (!listingId) return NextResponse.json({ watched: false });

    const userId = session.user.id;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, listingId },
      select: { id: true },
    });

    return NextResponse.json({ watched: !!existing });
  } catch (e) {
    console.error("watchlist status error:", e);
    return NextResponse.json({ watched: false });
  }
}