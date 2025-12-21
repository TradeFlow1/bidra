import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Vercel Cron hits this route on schedule.
 * Settles auctions that have ended:
 * - marks listing ENDED
 * - creates a PENDING order for winning bid if any
 */
export async function GET() {
  const now = new Date();

  const auctions = await prisma.listing.findMany({
    where: {
      type: "AUCTION",
      status: "ACTIVE",
      endsAt: { lte: now }
    },
    select: { id: true }
  });

  let settled = 0;

  for (const a of auctions) {
    const listingId = a.id;

    // Use transaction to avoid partial settle
    await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { id: listingId } });
      if (!listing || listing.status !== "ACTIVE") return;

      const top = await tx.bid.findFirst({
        where: { listingId },
        orderBy: { amount: "desc" }
      });

      await tx.listing.update({ where: { id: listingId }, data: { status: "ENDED" } });

      if (top) {
        // Prevent duplicate orders for same listing
        const existing = await tx.order.findFirst({ where: { listingId } });
        if (!existing) {
          await tx.order.create({
            data: {
              buyerId: top.bidderId,
              listingId,
              amount: top.amount,
              status: "PENDING"
            }
          });
        }
      }
    });

    settled += 1;
  }

  return NextResponse.json({ settled });
}
