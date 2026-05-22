import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Sign in required before declining an offer." }, { status: 401 });
    }

    const adult = await requireAdult(session);
    if (!adult.ok) {
      return NextResponse.json({ ok: false, error: "Your account is not eligible to manage offers." }, { status: adult.status || 403 });
    }

    const listingId = String(params?.id || "").trim();
    if (!listingId) return NextResponse.json({ ok: false, error: "Listing id is required." }, { status: 400 });

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        offers: {
          orderBy: { amount: "desc" },
          take: 1,
          select: { id: true, buyerId: true, amount: true },
        },
      },
    });

    if (!listing) return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
    if (listing.sellerId !== session.user.id) return NextResponse.json({ ok: false, error: "Only the seller can decline offers." }, { status: 403 });
    if (listing.status !== "ENDED") return NextResponse.json({ ok: false, error: "Offers can only be declined after the timed listing ends." }, { status: 409 });
    const topOffer = listing.offers[0];
    if (!topOffer) return NextResponse.json({ ok: false, error: "There is no offer to decline." }, { status: 400 });

    await prisma.offerDecision.upsert({
      where: { listingId_offerId: { listingId, offerId: topOffer.id } },
      create: {
        listingId,
        offerId: topOffer.id,
        sellerId: session.user.id,
        buyerId: topOffer.buyerId,
        amount: topOffer.amount,
        decision: "REJECTED",
      },
      update: {
        sellerId: session.user.id,
        buyerId: topOffer.buyerId,
        amount: topOffer.amount,
        decision: "REJECTED",
      },
    });

    await prisma.listing.update({ where: { id: listingId }, data: { status: "ACTIVE" } });

    return NextResponse.json({ ok: true, type: "OFFER_DECLINED" });
  } catch (e) {
    console.error("Decline highest offer error:", e);
    return NextResponse.json({ ok: false, error: "We could not decline the highest offer. Please try again." }, { status: 500 });
  }
}
