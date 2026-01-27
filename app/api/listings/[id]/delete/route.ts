import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

// Soft delete: never hard-delete Listings (FKs: watchlist, bids, reports, orders, messages, audit)
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adult = await requireAdult(session);
    if (!adult.ok) {
      return NextResponse.json({ error: adult.reason }, { status: adult.status });
    }

    const id = ctx.params.id;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = session.user.role;
    const isAdmin = role === "ADMIN";
    const isOwner = listing.sellerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (listing.status === "DELETED") {
      return NextResponse.json({ ok: true, already: true });
    }

    await prisma.listing.update({
      where: { id },
      data: {
        previousStatus: listing.status,
        status: "DELETED",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
