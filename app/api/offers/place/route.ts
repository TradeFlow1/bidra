import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { sendNewTopOfferEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const INC_CENTS = 1000; // $10.00 increment for visible offer ladder

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: String(gate?.reason || "Not allowed") },
      { status: gate?.status || 403 }
    );
  }

  const userId = gate?.session?.user?.id ? String(gate.session.user.id) : undefined;
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

  // MAX offer can be any amount. Only the VISIBLE ladder moves in $10 steps.

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
  // Visible offer ladder: do NOT force offers up to guide price.
  // If no offers yet: allow opening at $10. Otherwise: +$10 above highest.
  const minNext = currentHighest > 0 ? (currentHighest + INC_CENTS) : INC_CENTS;

  if (maxCents < minNext) {
    return NextResponse.json(
      { ok: false, error: `Offer must be at least $${(minNext / 100).toFixed(2)}.` },
      { status: 400 }
    );
  }

  // Auto-offers (keeps you on top up to your limit):
  // - store max in OfferMax
  // - compute visible offer based on top-2 maxes
  // - write visible offer to Bid ladder if it increases
  let result: any = null;
  try {
      result = await prisma.$transaction(async (tx) => {
        await tx.offerMax.upsert({
          where: { listingId_bidderId: { listingId: listing.id, bidderId: userId } },
          update: { maxAmount: maxCents },
          create: { listingId: listing.id, bidderId: userId, maxAmount: maxCents },
        });
    
         
        // Audit log: offer placed / max updated
        try {
          await tx.adminEvent.create({
            data: {
              type: "OFFER_PLACED",
              userId: userId,
              data: {
                listingId: listing.id,
                bidderId: userId,
                maxAmount: maxCents,
              },
            },
          });
        } catch (e) {
          console.warn("[ADMIN_AUDIT] Failed to log OFFER_PLACED", e);
        }
const top = await tx.offerMax.findMany({
          where: { listingId: listing.id },
          orderBy: { maxAmount: "desc" },
          take: 2,
          select: { bidderId: true, maxAmount: true },
        });
    
        const leader = top[0];
        const runner = top.length > 1 ? top[1] : null;
    
        // VISIBLE ladder is $10 steps. Cap max amounts down to nearest $10 for ladder math.
        const leaderCap = leader ? Math.floor(leader.maxAmount / INC_CENTS) * INC_CENTS : 0;
        const runnerCap = runner ? Math.floor(runner.maxAmount / INC_CENTS) * INC_CENTS : 0;
    
        // Re-check highest inside txn
        const nowHighest = await tx.bid.findFirst({
          where: { listingId: listing.id },
          orderBy: { amount: "desc" },
          select: { amount: true, bidderId: true },
        });
    
        const highestAmt = nowHighest?.amount ?? 0;
        const highestBidder = nowHighest?.bidderId ?? null;
        // Visible offer ladder: do NOT force offers up to guide price.
        const minNextTxn = highestAmt > 0 ? (highestAmt + INC_CENTS) : INC_CENTS;
    
        if (!leader) {
          return { highestAmt, highestBidder, placed: false };
        }
    
        if (leaderCap < minNextTxn) {
          // This should be impossible given earlier check, but keep safe.
          return { highestAmt, highestBidder, placed: false };
        }
    
        let newVisible = 0;
    
        if (runner) {
          const target = runnerCap + INC_CENTS;
          newVisible = Math.min(leaderCap, Math.max(minNextTxn, target));
        } else {
          newVisible = Math.min(leaderCap, minNextTxn);
        }
    
        // Only write a new ladder row if it actually increases the visible highest
        if (newVisible > highestAmt) {
          await tx.bid.create({
            data: {
              amount: newVisible,
              bidderId: leader.bidderId,
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
                  bidderId: leader.bidderId,
                  amount: newVisible,
                  previousTop: highestAmt,
                },
              },
            });
          } catch (e) {
            // never block offer placement on admin logging
            console.warn("[ADMIN_VISIBILITY] Failed to log OFFER_NEW_TOP", e);
          }
    
          return { highestAmt: newVisible, highestBidder: leader.bidderId, placed: true };
        }
    
        return { highestAmt, highestBidder, placed: false };
      });
  } catch (e) {
    console.error("offers/place failed", e);
    return NextResponse.json({ ok: false, error: "Offer failed." }, { status: 500 });
  }

  const isWinning = result.highestBidder === userId;

  // Email notify seller ONLY when the visible top offer actually moved (placed:true)
  try {
    if (result?.placed) {
      const seller = await prisma.user.findUnique({
        where: { id: listing.sellerId },
        select: { email: true },
      });
      const to = String(seller?.email || "").trim();
      if (to) {
        await sendNewTopOfferEmail({
          to,
          listingId: listing.id,
          listingTitle: (listing as any)?.title || null,
          amountCents: Number(result.highestAmt || 0),
        });
      }
    }
  } catch (e) {
    console.warn("[EMAIL_NOTIFY] offer notify failed", e);
  }

  return NextResponse.json({
    ok: true,
    status: isWinning ? "TOP" : "OUTBID",
    currentOfferCents: result.highestAmt,
  });
}
