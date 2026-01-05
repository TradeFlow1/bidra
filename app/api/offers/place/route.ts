import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, reason: gate.reason }), {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const listingId = String(body?.listingId ?? "");
    const amountDollars = Number(body?.amount);

    if (!listingId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing listingId." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
      return new Response(JSON.stringify({ ok: false, error: "Enter a valid amount." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // dollars -> cents (int)
    const maxOfferCents = Math.round(amountDollars * 100);

    // Need user id (requireAdult implies signed-in adult, but we still read session via auth())
    // requireAdult uses auth() internally in your codebase; we re-check session here safely by reading gate.session if present.
    const userId = (gate as any)?.session?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Not signed in." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    // Fetch listing + current highest offer (stored as Bid.amount) + start price
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        type: true,
        status: true,
        price: true,
        endsAt: true,
        sellerId: true,
        bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
      },
    });

    if (!listing) {
      return new Response(JSON.stringify({ ok: false, error: "Listing not found." }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    // Only timed-offer listings (AUCTION) accept offers
    if (listing.type !== "AUCTION") {
      return new Response(JSON.stringify({ ok: false, error: "Offers are not available for this listing." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Must be active + not ended
    if (listing.status !== "ACTIVE") {
      return new Response(JSON.stringify({ ok: false, error: "Listing is not active." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (listing.endsAt && new Date(listing.endsAt).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ ok: false, error: "Listing has ended." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Seller cannot place offers on own listing
    if (listing.sellerId === userId) {
      return new Response(JSON.stringify({ ok: false, error: "You can’t place an offer on your own listing." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const highestOfferCents =
      listing.bids && listing.bids.length ? (listing.bids[0] as any).amount : 0;

    const startOfferCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;

    // Same rule as UI: $1 increment minimum above highest, and not below start price
    const minOfferCents = Math.max(startOfferCents, highestOfferCents + 100);

    if (maxOfferCents < minOfferCents) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Offer must be at least $${(minOfferCents / 100).toFixed(2)}.`,
          minOfferCents,
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Record the offer in Bid table (internal storage), but API language stays "offer"
    await prisma.bid.create({
      data: {
        listingId,
        bidderId: userId,
        amount: maxOfferCents,
      },
    });

    // Return current top offer after insert
    const top = await prisma.bid.findFirst({
      where: { listingId },
      orderBy: { amount: "desc" },
      select: { amount: true, bidderId: true },
    });

    const currentOfferCents = top?.amount ?? maxOfferCents;
    const status = top?.bidderId === userId ? "WINNING" : "OUTBID";

    return new Response(
      JSON.stringify({
        ok: true,
        status,
        currentOfferCents,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Offer failed." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
