import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, reason: gate.reason }), {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }

  const userId = (gate as any)?.session?.user?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const listingId = String(body?.listingId ?? "");
  const amountDollars = Number(body?.amount);

  if (!listingId || !Number.isFinite(amountDollars) || amountDollars <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid offer" }, { status: 400 });
  }

  const amountCents = Math.round(amountDollars * 100);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      sellerId: true,
      status: true,
      type: true,
      price: true,
      buyNowPrice: true,
      endsAt: true,
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, bidderId: true } },
    },
  });

  if (!listing) return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  if (listing.status !== "ACTIVE") return NextResponse.json({ ok: false, error: "Listing is not active" }, { status: 400 });

  // Offers are only valid on timed offer listings
  if (listing.type !== "AUCTION") {
    return NextResponse.json({ ok: false, error: "Offers are only available on timed offer listings." }, { status: 400 });
  }

  if (listing.endsAt && new Date(listing.endsAt).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, error: "Listing has ended" }, { status: 400 });
  }

  if (listing.sellerId === userId) {
    return NextResponse.json({ ok: false, error: "You can’t make an offer on your own listing." }, { status: 400 });
  }

  const highest = listing.bids && listing.bids.length ? listing.bids[0].amount : 0;
  const startOffer = listing.price || 0;
  const minOfferCents = Math.max(startOffer, highest + 100);

  if (amountCents < minOfferCents) {
    return NextResponse.json(
      { ok: false, error: `Offer must be at least $${(minOfferCents / 100).toFixed(2)}.` },
      { status: 400 }
    );
  }

  // Record offer (stored in Bid table for now)
  await prisma.bid.create({
    data: {
      amount: amountCents,
      bidderId: userId,
      listingId: listing.id,
    },
  });

  const nowHighest = await prisma.bid.findFirst({
    where: { listingId: listing.id },
    orderBy: { amount: "desc" },
    select: { amount: true, bidderId: true },
  });

  const isWinning = nowHighest?.bidderId === userId;

  return NextResponse.json({
    ok: true,
    status: isWinning ? "WINNING" : "OUTBID",
    currentOfferCents: nowHighest?.amount ?? amountCents,
  });
}
