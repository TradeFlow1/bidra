import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const me = session?.user as unknown as { id?: string } | undefined;

    if (!me || !me.id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const listingId = params.id;

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
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (listing.sellerId !== me.id) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    // Buy Now parity: only ACTIVE listings can convert to SOLD
    if (listing.status !== "ACTIVE") {
      return NextResponse.json({ ok: false }, { status: 409 });
    }

    const offer = listing.offers[0];
    if (!offer) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // V2: acceptance converts to SOLD and MUST create an Order (pending pickup) atomically.
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      // Race-safe SOLD transition
      const updated = await tx.listing.updateMany({
        where: { id: listingId, status: "ACTIVE", OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        data: { status: "SOLD" },
      });

      if (updated.count !== 1) {
        // Idempotency: if an order already exists for this listing+buyer in the pre-schedule state, treat as success.
        const existing = await tx.order.findFirst({
          where: { listingId, buyerId: offer.bidderId, status: OrderStatus.PICKUP_REQUIRED },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (existing) { return { ok: true, orderId: existing.id }; }
        throw new Error("LISTING_NOT_ACTIVE");
      }

      // Record seller acceptance via OfferDecision (OfferDecision requires amount)
      await tx.offerDecision.upsert({
        where: { listingId_offerId: { listingId, offerId: offer.id } },
        create: {
          listingId,
          offerId: offer.id,
          amount: offer.amount,
          sellerId: (me.id as string),
          buyerId: offer.bidderId,
          decision: "ACCEPTED",
        },
        update: {
          amount: offer.amount,
          sellerId: (me.id as string),
          buyerId: offer.bidderId,
          decision: "ACCEPTED",
        },
      });

      // Create order: enters V2 enforcement chain
      const order = await tx.order.create({
        data: {
          listingId,
          buyerId: offer.bidderId,
          amount: offer.amount,
          status: OrderStatus.PICKUP_REQUIRED,
          outcome: "PENDING",
        },
        select: { id: true },
      });

      return { ok: true, orderId: order.id };
    });

    return NextResponse.json({
      ok: true,
      outcome: "PENDING",
      type: "OFFER_ACCEPTED",
      orderId: (result as any).orderId || null,
    });
  } catch (e) {
    console.error("Accept highest offer error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
