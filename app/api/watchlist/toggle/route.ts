import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adult = await requireAdult(session);
    if (!adult.ok) {
      return NextResponse.json({ error: adult.reason }, { status: adult.status });
    }

    const body = await req.json().catch(function () { return {}; });
    const listingId = String((body as any)?.listingId ?? "").trim();

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });

    if (!listing || listing.status === "DELETED") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
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

    if (existing) {
      await prisma.watchlist.delete({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: listingId,
          },
        },
      });

      return NextResponse.json({ ok: true, watched: false });
    }

    await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        listingId: listingId,
      },
    });

    return NextResponse.json({ ok: true, watched: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
