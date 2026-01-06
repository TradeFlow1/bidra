import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function hoursUntil(date: Date | null | undefined) {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return ms / (1000 * 60 * 60);
}

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: (gate as any).error ?? "Access restricted" },
      { status: (gate as any).status ?? 401 }
    );
  }

  const userId = (gate as any)?.session?.user?.id as string | undefined;
  if (!userId) return jsonError("Not signed in", 401);

  const body = await req.json().catch(() => ({}));
  const listingId = String(body?.listingId ?? "").trim();
  if (!listingId) return jsonError("Missing listingId", 400);

  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        type: true,
        price: true,
        buyNowPrice: true,
        endsAt: true,
      },
    });

    if (!listing) return { ok: false, status: 404 as const, error: "Listing not found." };
    if (listing.status !== "ACTIVE") return { ok: false, status: 400 as const, error: "Listing is not available." };
    if (listing.sellerId === userId) return { ok: false, status: 400 as const, error: "You cannot buy your own listing." };

    if (listing.endsAt && new Date(listing.endsAt).getTime() <= Date.now()) {
      return { ok: false, status: 400 as const, error: "Listing has ended." };
    }

    // Buy Now rules (Kevin model):
    // - FIXED_PRICE: Buy Now allowed (primary).
    // - Timed offers (AUCTION): Buy Now is NOT available initially; only valid in the final 24h window
    //   AND only if seller has set buyNowPrice.
    if (listing.type !== "FIXED_PRICE" && listing.type !== "AUCTION") {
      return { ok: false, status: 400 as const, error: "Buy Now is not available on this listing type." };
    }

    const guidePriceCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;

    if (listing.type === "AUCTION") {
      if (typeof listing.buyNowPrice !== "number") {
        return { ok: false, status: 400 as const, error: "Buy Now is not available on this listing." };
      }

      const hrs = hoursUntil(listing.endsAt as any);
      const inFinalWindow = typeof hrs === "number" ? hrs <= 24 : false;
      if (!inFinalWindow) {
        return { ok: false, status: 400 as const, error: "Buy Now is not available yet." };
      }

      const top = await tx.bid.findFirst({
        where: { listingId },
        orderBy: { amount: "desc" },
        select: { amount: true },
      });

      const highestOfferCents = top?.amount ?? 0;
      const currentOfferCents = Math.max(guidePriceCents, highestOfferCents);

      if (currentOfferCents >= listing.buyNowPrice) {
        return { ok: false, status: 400 as const, error: "Buy Now is no longer available." };
      }
    }

    const amount =
      listing.type === "AUCTION"
        ? (listing.buyNowPrice as number)
        : ((listing.buyNowPrice ?? listing.price) as number);

    const order = await tx.order.create({
      data: {
        listingId,
        buyerId: userId,
        amount,
        status: "PENDING",
        outcome: "PENDING",
      },
      select: { id: true },
    });

    await tx.listing.update({
      where: { id: listingId },
      data: { status: "SOLD", previousStatus: "ACTIVE" },
    });

    return { ok: true as const, orderId: order.id };
  });

  return NextResponse.json(result, { status: (result as any).ok ? 200 : ((result as any).status ?? 400) });
}
