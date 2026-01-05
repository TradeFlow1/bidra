import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: (gate as any).error ?? "Access restricted" },
      { status: (gate as any).status ?? 401 }
    );
  }

  const userId = (gate as any)?.session?.user?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const listingId = String(body?.listingId ?? "").trim();
  if (!listingId) {
    return NextResponse.json({ ok: false, error: "Missing listingId" }, { status: 400 });
  }

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

    // Buy now is allowed on FIXED_PRICE and timed offers listings (AUCTION).
    if (listing.type !== "FIXED_PRICE" && listing.type !== "AUCTION") {
      return { ok: false, status: 400 as const, error: "Buy now is not available on this listing type." };
    }

    // 85% rule ONLY applies to timed offers listings (AUCTION).
    if (listing.type === "AUCTION") {
      if (typeof listing.buyNowPrice !== "number") {
        return { ok: false, status: 400 as const, error: "Buy now is not available on this listing." };
      }

      const top = await tx.bid.findFirst({
        where: { listingId },
        orderBy: { amount: "desc" },
        select: { amount: true },
      });

      const highestOfferCents = top?.amount ?? 0;
      const startOfferCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;
      const currentOfferCents = Math.max(startOfferCents, highestOfferCents);

      const threshold = Math.floor(listing.buyNowPrice * 0.85);
      if (currentOfferCents >= threshold) {
        return { ok: false, status: 400 as const, error: "Buy now is no longer available." };
      }
    }

    const amount = (listing.type === "AUCTION"
      ? (listing.buyNowPrice as number)
      : ((listing.buyNowPrice ?? listing.price) as number)
    ) as number;

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
