import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

// Soft delete: never hard-delete Listings (FKs: watchlist, bids, reports, orders, messages, audit)
export async function POST(_: Request, ctx: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adult = await requireAdult(session);
    if (!adult.ok) return NextResponse.json({ error: adult.reason }, { status: adult.status });

    const id = ctx.params.id;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, status: true, previousStatus: true },
    });

    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = listing.sellerId === session.user.id;
    const isAdmin = (session.user as any)?.role === "ADMIN";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // (Optional) remove from watchlists so it disappears immediately
    await prisma.watchlist.deleteMany({ where: { listingId: id } });

    // Soft delete listing
    await prisma.listing.update({
      where: { id },
      data: {
        previousStatus: listing.status,
        status: "DELETED",
      },
    });

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
