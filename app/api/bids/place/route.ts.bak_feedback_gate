import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

function minIncrementCents(current: number) {
  if (current < 2000) return 100;
  if (current < 10000) return 250;
  if (current < 50000) return 500;
  if (current < 200000) return 1000;
  return 2500;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`bids:place:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { listingId, amount } = await req.json().catch(() => ({}));
  const id = String(listingId ?? "");
  const bidAmount = Number(amount);

  if (!id || !Number.isFinite(bidAmount)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.type !== "AUCTION" || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing not available" }, { status: 400 });
  }
  if (listing.sellerId === user.id) return NextResponse.json({ error: "Cannot bid on your own listing" }, { status: 400 });

  const top = await prisma.bid.findFirst({
    where: { listingId: id },
    orderBy: { amount: "desc" }
  });

  const topAmount = top?.amount ?? 0;
  const inc = minIncrementCents(Math.max(topAmount, listing.price));
  const minBid = Math.max(topAmount + inc, listing.price);
  const cents = Math.round(bidAmount * 100);

  if (cents < minBid) {
    return NextResponse.json({ error: `Bid must be at least $${(minBid/100).toFixed(2)}` }, { status: 400 });
  }

  // anti-sniping: extend end time by 2 minutes if bid placed within last 2 minutes
  const now = new Date();
  let newEndsAt = listing.endsAt;
  if (listing.endsAt) {
    const msLeft = listing.endsAt.getTime() - now.getTime();
    if (msLeft <= 120_000) {
      newEndsAt = new Date(listing.endsAt.getTime() + 120_000);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.bid.create({
      data: { listingId: id, bidderId: user.id, amount: cents }
    });
    if (newEndsAt && listing.endsAt?.getTime() !== newEndsAt.getTime()) {
      await tx.listing.update({ where: { id }, data: { endsAt: newEndsAt } });
    }
  });

  return NextResponse.json({ ok: true });
}
