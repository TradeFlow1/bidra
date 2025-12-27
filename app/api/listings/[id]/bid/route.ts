import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const listingId = String(ctx?.params?.id || "").trim();
    if (!listingId) {
      return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Bid must be greater than 0." }, { status: 400 });
    }

    const bidAmount = Math.round(amount);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, price: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: "You cannot bid on your own listing." }, { status: 400 });
    }

    const topBid = await prisma.bid.findFirst({
      where: { listingId },
      orderBy: { amount: "desc" },
      select: { amount: true },
    });

    const min = topBid?.amount ?? listing.price ?? 0;
    if (bidAmount <= min) {
      return NextResponse.json(
        { error: `Bid must be greater than ${(Number(min) / 100).toFixed(2)}.` },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        listingId,
        bidderId: session.user.id,
        amount: bidAmount,
      },
    });

    return NextResponse.json({ bid });
  } catch (e: any) {
    console.error("Place bid error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}