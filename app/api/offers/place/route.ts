import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";

const INC_CENTS = 100; // $1.00 increment for visible offer ladder

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

  const maxCents = Math.round(amountDollars * 100);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      sellerId: true,
      status: true,
      type: true,
      price: true,
      endsAt: true,
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, bidderId: true } },
    },
  });

  if (!listing) return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  if (listing.status !== "ACTIVE") return NextResponse.json({ ok: false, error: "Listing is not active" }, { status: 400 });

  // Offers are only valid on timed offer listings (AUCTION type in schema)
  if (listing.type !== "AUCTION") {
    return NextResponse.json({ ok: false, error: "Offers are only available on timed offer listings." }, { status: 400 });
  }

  if (listing.endsAt && new Date(listing.endsAt).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, error: "Listing has ended" }, { status: 400 });
  }

  if (listing.sellerId === userId) {
    return NextResponse.json({ ok: false, error: "You can’t make an offer on your own listing." }, { status: 400 });
  }

  const currentHighest = listing.bids && listing.bids.length ? listing.bids[0].amount : 0;
  const startOffer = listing.price || 0;
  const minNext = Math.max(startOffer, currentHighest + INC_CENTS);

  if (maxCents < minNext) {
    return NextResponse.json(
      { ok: false, error: `Max offer must be at least $${(minNext / 100).toFixed(2)}.` },
      { status: 400 }
    );
  }

  // Proxy offers:
  // - store max in OfferMax
  // - compute visible offer based on top-2 maxes
  // - write visible offer to Bid ladder if it increases
  const result = await prisma.$transaction(async (tx) => {
    await tx.offerMax.upsert({
      where: { listingId_bidderId: { listingId: listing.id, bidderId: userId } },
      update: { maxAmount: maxCents },
      create: { listingId: listing.id, bidderId: userId, maxAmount: maxCents },
    });

    const top = await tx.offerMax.findMany({
      where: { listingId: listing.id },
      orderBy: { maxAmount: "desc" },
      take: 2,
      select: { bidderId: true, maxAmount: true },
    });

    const winner = top[0];
    const runner = top.length > 1 ? top[1] : null;

    // Re-check highest inside txn
    const nowHighest = await tx.bid.findFirst({
      where: { listingId: listing.id },
      orderBy: { amount: "desc" },
      select: { amount: true, bidderId: true },
    });

    const highestAmt = nowHighest?.amount ?? 0;
    const highestBidder = nowHighest?.bidderId ?? null;
    const minNextTxn = Math.max(startOffer, highestAmt + INC_CENTS);

    if (!winner) {
      return { highestAmt, highestBidder, placed: false };
    }

    if (winner.maxAmount < minNextTxn) {
      // This should be impossible given earlier check, but keep safe.
      return { highestAmt, highestBidder, placed: false };
    }

    let newVisible = 0;

    if (runner) {
      const target = runner.maxAmount + INC_CENTS;
      newVisible = Math.min(winner.maxAmount, Math.max(minNextTxn, target));
    } else {
      newVisible = Math.min(winner.maxAmount, minNextTxn);
    }

    // Only write a new ladder row if it actually increases the visible highest
    if (newVisible > highestAmt) {
      await tx.bid.create({
        data: {
          amount: newVisible,
          bidderId: winner.bidderId,
          listingId: listing.id,
        },
      });

      // Admin visibility: seller has a new top offer (drives "Needs attention" later)
      try {
        await tx.adminEvent.create({
          data: {
            type: "OFFER_NEW_TOP",
            userId: listing.sellerId,
            data: {
              listingId: listing.id,
              sellerId: listing.sellerId,
              bidderId: winner.bidderId,
              amount: newVisible,
              previousTop: highestAmt,
            },
          },
        });
      } catch (e) {
        // never block offer placement on admin logging
        console.warn("[ADMIN_VISIBILITY] Failed to log OFFER_NEW_TOP", e);
      }

      return { highestAmt: newVisible, highestBidder: winner.bidderId, placed: true };
    }

    return { highestAmt, highestBidder, placed: false };
  });

  const isWinning = result.highestBidder === userId;

  return NextResponse.json({
    ok: true,
    status: isWinning ? "WINNING" : "OUTBID",
    currentOfferCents: result.highestAmt,
  });
}
