import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Sign in required before accepting an offer." }, { status: 401 });
    }

    const adult = await requireAdult(session);
    if (!adult.ok) {
      return NextResponse.json({ ok: false, error: "Your account is not eligible to accept offers." }, { status: adult.status || 403 });
    }

    const me = session.user as unknown as { id?: string } | undefined;

    const listingId = String(params?.id || "").trim();
    if (!listingId) {
      return NextResponse.json({ ok: false, error: "Listing id is required before accepting an offer." }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        offers: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
    }

    if (listing.sellerId !== me?.id) {
      return NextResponse.json({ ok: false, error: "Only the seller can accept the highest offer." }, { status: 403 });
    }

    if (listing.status !== "ENDED") {
      return NextResponse.json({ ok: false, error: "Offers can only be accepted after the timed listing ends." }, { status: 409 });
    }

    const offer = listing.offers[0];
    if (!offer) {
      return NextResponse.json({ ok: false, error: "There is no offer to accept yet." }, { status: 400 });
    }

    const result = await prisma.$transaction(async function (tx) {
      const updated = await tx.listing.updateMany({
        where: { id: listingId, status: "ENDED" },
        data: { status: "SOLD" },
      });

      if (updated.count !== 1) {
        const existing = await tx.order.findFirst({
          where: { listingId: listingId, buyerId: offer.buyerId, status: OrderStatus.PENDING },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (existing) {
          return { ok: true, orderId: existing.id, reusedExistingOrder: true };
        }
        throw new Error("LISTING_NOT_ACTIVE");
      }

      await tx.offerDecision.upsert({
        where: { listingId_offerId: { listingId: listingId, offerId: offer.id } },
        create: {
          listingId: listingId,
          offerId: offer.id,
          amount: offer.amount,
          sellerId: String(me.id),
          buyerId: offer.buyerId,
          decision: "ACCEPTED",
        },
        update: {
          amount: offer.amount,
          sellerId: String(me.id),
          buyerId: offer.buyerId,
          decision: "ACCEPTED",
        },
      });

      const order = await tx.order.create({
        data: {
          listingId: listingId,
          buyerId: offer.buyerId,
          amount: offer.amount,
          status: OrderStatus.PENDING,
          outcome: "PENDING",
        },
        select: { id: true },
      });

      return { ok: true, orderId: order.id, reusedExistingOrder: false };
    });

    return NextResponse.json({
      ok: true,
      outcome: "PENDING",
      type: "OFFER_ACCEPTED",
      orderId: (result as any).orderId || null,
    });
  } catch (e) {
    console.error("Accept highest offer error:", e);
    return NextResponse.json({ ok: false, error: "We could not accept the highest offer. Please try again." }, { status: 500 });
  }
}
