import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { sendNewTopOfferEmail } from "@/lib/email";
import { getIdempotencyKey } from "@/lib/transaction-safety";

export const dynamic = "force-dynamic";

function nextVisibleOfferAmount(startingAmount: number, leaderMax: number, challengerMax: number, increment: number) {
  const safeIncrement = Math.max(1, increment);
  const safeStart = Math.max(1, startingAmount);

  if (leaderMax <= 0) {
    return Math.max(safeStart, Math.min(challengerMax, safeStart));
  }

  if (challengerMax > leaderMax) {
    return Math.min(challengerMax, leaderMax + safeIncrement);
  }

  return Math.min(leaderMax, challengerMax + safeIncrement);
}

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    const message = gate?.status === 401
      ? "Sign in required before making an offer."
      : "Your account is not eligible to make offers.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: gate?.status || 403 }
    );
  }

  const userId = gate?.session?.user?.id ? String(gate.session.user.id) : "";
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in required before making an offer." }, { status: 401 });
  }

  const body = await req.json().catch(function () { return {}; });
  const listingId = String(body?.listingId || "").trim();
  const amountDollars = Number(body?.amount);

  if (!listingId || !Number.isFinite(amountDollars) || amountDollars <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid offer amount before submitting." }, { status: 400 });
  }

  const maxAmountCents = Math.round(amountDollars * 100);
  const idempotencyKey = getIdempotencyKey(req, [userId, listingId, maxAmountCents]);

  try {
    const result = await prisma.$transaction(async function (tx) {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          title: true,
          sellerId: true,
          status: true,
          type: true,
          price: true,
          currentOfferAmount: true,
          currentOfferBuyerId: true,
          offerIncrement: true,
          offers: {
            orderBy: [{ maxAmount: "desc" }, { createdAt: "asc" }],
            take: 1,
            select: { id: true, amount: true, maxAmount: true, displayAmount: true, buyerId: true },
          },
        },
      });

      if (!listing) {
        return { ok: false, error: "Listing not found", status: 404 } as const;
      }

      if (listing.status !== "ACTIVE") {
        return { ok: false, error: "Offers can only be placed on active listings.", status: 400 } as const;
      }

      if (listing.type !== "OFFERABLE") {
        return { ok: false, error: "Offers are only available on offerable listings.", status: 400 } as const;
      }

      if (listing.sellerId === userId) {
        return { ok: false, error: "You cannot make an offer on your own listing.", status: 400 } as const;
      }

      if (maxAmountCents <= 0) {
        return { ok: false, error: "Offer must be greater than 0.", status: 400 } as const;
      }

      if (maxAmountCents < listing.price) {
        return { ok: false, error: "Your offer must be at least the listing start price.", status: 400 } as const;
      }

      const leader = listing.offers && listing.offers.length ? listing.offers[0] : null;
      const leaderMax = leader ? Number(leader.maxAmount || leader.amount || 0) : 0;
      const leaderBuyerId = leader ? String(leader.buyerId || "") : "";
      const increment = Number(listing.offerIncrement || 100);
      const displayAmount = nextVisibleOfferAmount(listing.price, leaderMax, maxAmountCents, increment);
      const challengerLeads = !leader || maxAmountCents > leaderMax;
      const currentOfferBuyerId = challengerLeads ? userId : leaderBuyerId;
      const currentOfferAmount = displayAmount;

      const recentSince = new Date(Date.now() - 60 * 1000);
      const existingOffer = await tx.offer.findFirst({
        where: {
          listingId: listing.id,
          buyerId: userId,
          maxAmount: maxAmountCents,
          createdAt: { gte: recentSince },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, amount: true, maxAmount: true, displayAmount: true, buyerId: true },
      });

      if (existingOffer) {
        await tx.listing.update({
          where: { id: listing.id },
          data: {
            currentOfferAmount: currentOfferAmount,
            currentOfferBuyerId: currentOfferBuyerId,
            offerIncrement: increment,
          },
        });

        try {
          await tx.adminEvent.create({
            data: {
              type: "OFFER_DUPLICATE_REUSED",
              userId: userId,
              data: { listingId: listing.id, buyerId: userId, maxAmount: maxAmountCents, offerId: existingOffer.id, idempotencyKey },
            },
          });
        } catch (_auditErr) {}

        return {
          ok: true,
          reused: true,
          listing: listing,
          offerId: existingOffer.id,
          amount: Number(existingOffer.displayAmount || existingOffer.amount || currentOfferAmount),
          currentOfferAmount: currentOfferAmount,
          challengerLeads: challengerLeads,
        } as const;
      }

      const offer = await tx.offer.create({
        data: {
          amount: displayAmount,
          maxAmount: maxAmountCents,
          displayAmount: displayAmount,
          buyerId: userId,
          listingId: listing.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        select: { id: true, amount: true, maxAmount: true, displayAmount: true, buyerId: true },
      });

      await tx.listing.update({
        where: { id: listing.id },
        data: {
          currentOfferAmount: currentOfferAmount,
          currentOfferBuyerId: currentOfferBuyerId,
          offerIncrement: increment,
        },
      });

      try {
        await tx.adminEvent.create({
          data: {
            type: "OFFER_PLACED",
            userId: userId,
            data: {
              listingId: listing.id,
              buyerId: userId,
              amount: offer.amount,
              maxAmountStored: true,
              idempotencyKey: idempotencyKey,
              notificationChannel: "email-if-configured",
              pushNotification: false,
            },
          },
        });
      } catch (_auditErr) {}

      return {
        ok: true,
        reused: false,
        listing: listing,
        offerId: offer.id,
        amount: offer.amount,
        currentOfferAmount: currentOfferAmount,
        challengerLeads: challengerLeads,
      } as const;
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    if (result.challengerLeads) {
      try {
        const seller = await prisma.user.findUnique({
          where: { id: result.listing.sellerId },
          select: { email: true },
        });

        const to = String(seller?.email || "").trim();
        if (to) {
          await sendNewTopOfferEmail({
            to: to,
            listingId: result.listing.id,
            listingTitle: result.listing.title || null,
            amountCents: result.currentOfferAmount,
          });
        }
      } catch (_emailErr) {}
    }

    return NextResponse.json({
      ok: true,
      status: result.challengerLeads ? "TOP" : "OUTBID",
      isTop: result.challengerLeads,
      duplicateReused: result.reused,
      offerId: result.offerId,
      currentOfferCents: result.currentOfferAmount,
    });
  } catch (e) {
    console.error("offers/place failed", e);
    return NextResponse.json({ ok: false, error: "We could not place your offer. Please try again." }, { status: 500 });
  }
}
