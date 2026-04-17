import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ watched: false, authed: false }, { status: 200 });
    }

    const url = new URL(req.url);
    const listingId = String(url.searchParams.get("listingId") ?? "").trim();

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      watched: !!existing,
      authed: true,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
