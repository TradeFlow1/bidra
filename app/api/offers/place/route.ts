import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { sendNewTopOfferEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const MIN_INCREMENT_CENTS = 1000;

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: String(gate?.reason || "Not allowed") },
      { status: gate?.status || 403 }
    );
  }

  const userId = gate?.session?.user?.id ? String(gate.session.user.id) : "";
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(function () { return {}; });
  const listingId = String(body?.listingId || "").trim();
  const amountDollars = Number(body?.amount);

  if (!listingId || !Number.isFinite(amountDollars) || amountDollars <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid offer" }, { status: 400 });
  }

  const amountCents = Math.round(amountDollars * 100);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      sellerId: true,
      status: true,
      type: true,
      offers: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true, buyerId: true },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  }

  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Listing is not active" }, { status: 400 });
  }

  if (listing.type !== "OFFERABLE") {
    return NextResponse.json({ ok: false, error: "Offers are only available on offerable listings." }, { status: 400 });
  }

  if (listing.sellerId === userId) {
    return NextResponse.json({ ok: false, error: "You cannot make an offer on your own listing." }, { status: 400 });
  }

  const highest = listing.offers && listing.offers.length ? listing.offers[0].amount : 0;
  const minNext = highest > 0 ? (highest + MIN_INCREMENT_CENTS) : MIN_INCREMENT_CENTS;

  if (amountCents < minNext) {
    return NextResponse.json({ ok: false, error: "Offer is too low." }, { status: 400 });
  }

  try {
    const offer = await prisma.offer.create({
      data: {
        amount: amountCents,
        buyerId: userId,
        listingId: listing.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, amount: true, buyerId: true },
    });

    try {
      await prisma.adminEvent.create({
        data: {
          type: "OFFER_PLACED",
          userId: userId,
          data: {
            listingId: listing.id,
            buyerId: userId,
            amount: offer.amount,
          },
        },
      });
    } catch (_auditErr) {}

    try {
      const seller = await prisma.user.findUnique({
        where: { id: listing.sellerId },
        select: { email: true },
      });

      const to = String(seller?.email || "").trim();
      if (to) {
        await sendNewTopOfferEmail({
          to: to,
          listingId: listing.id,
          listingTitle: listing.title || null,
          amountCents: offer.amount,
        });
      }
    } catch (_emailErr) {}

    return NextResponse.json({
      ok: true,
      status: "PLACED",
      offerId: offer.id,
      currentOfferCents: offer.amount,
    });
  } catch (e) {
    console.error("offers/place failed", e);
    return NextResponse.json({ ok: false, error: "Offer failed." }, { status: 500 });
  }
}