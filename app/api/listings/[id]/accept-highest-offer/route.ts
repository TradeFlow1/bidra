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

    const listingId = String(params?.id || "").trim();
    if (!listingId) {
      return NextResponse.json({ ok: false }, { status: 400 });
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
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (listing.sellerId !== me.id) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    if (listing.status !== "ENDED") {
      return NextResponse.json({ ok: false, error: "Offers can only be accepted after the timed listing ends." }, { status: 409 });
    }

    const offer = listing.offers[0];
    if (!offer) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const result = await prisma.$transaction(async function (tx) {
      const updated = await tx.listing.updateMany({
        where: { id: listingId, status: "ENDED" },
        data: { status: "SOLD" },
      });

      if (updated.count !== 1) {
        const existing = await tx.order.findFirst({
          where: { listingId: listingId, buyerId: offer.buyerId, status: OrderStatus.PICKUP_REQUIRED },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (existing) {
          return { ok: true, orderId: existing.id };
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
