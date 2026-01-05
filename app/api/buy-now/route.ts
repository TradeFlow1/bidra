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

  const userId = (gate as any)?.session?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ ok: false, error: "Not signed in." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const listingId = String(body?.listingId ?? "");
    if (!listingId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing listingId." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          status: true,
          type: true,
          price: true,
          buyNowPrice: true,
          sellerId: true,
          endsAt: true,
        },
      });

      if (!listing) return { ok: false, status: 404 as const, error: "Listing not found." };
      if (listing.status !== "ACTIVE") return { ok: false, status: 400 as const, error: "Listing is not active." };
      if (listing.endsAt && new Date(listing.endsAt).getTime() <= Date.now())
        return { ok: false, status: 400 as const, error: "Listing has ended." };
      if (listing.sellerId === userId)
        return { ok: false, status: 400 as const, error: "You can’t buy your own listing." };

      if (typeof listing.buyNowPrice !== "number" || listing.buyNowPrice <= 0) {
        return { ok: false, status: 400 as const, error: "Buy now is not available for this listing." };
      }

      // 85% rule: disable buy now when current top offer reaches threshold
      if (listing.type === "AUCTION") {
        const top = await tx.bid.findFirst({
          where: { listingId },
          orderBy: { amount: "desc" },
          select: { amount: true },
        });

        const highestOfferCents = top?.amount ?? 0;
        const startOfferCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;
        const currentOfferCents = Math.max(startOfferCents, highestOfferCents);

        const threshold = Math.floor((listing.buyNowPrice as number) * 0.85);
        if (currentOfferCents >= threshold) {
          return { ok: false, status: 400 as const, error: "Buy now is no longer available." };
        }
      }

      const order = await tx.order.create({
        data: {
          listingId,
          buyerId: userId,
          amount: listing.buyNowPrice as number,
          status: "PENDING",
          outcome: "PENDING",
        },
        select: { id: true },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: { status: "SOLD", previousStatus: "ACTIVE" },
      });

      return { ok: true, orderId: order.id };
    });

    if (!(result as any).ok) {
      return new Response(JSON.stringify({ ok: false, error: (result as any).error }), {
        status: (result as any).status ?? 400,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, orderId: (result as any).orderId }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Buy now failed." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
