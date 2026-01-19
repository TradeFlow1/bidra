import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function hoursUntil(dt: any) {
  if (!dt) return null
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return null
  return (d.getTime() - Date.now()) / (1000 * 60 * 60)
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return jsonError("Not authenticated", 401)

    const adult = await requireAdult(session)
    if (!adult.ok) return jsonError(adult.reason || "Restricted", 403)

    const id = ctx?.params?.id
    if (!id) return jsonError("Missing listing id", 400)

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        bids: { orderBy: { amount: "desc" }, take: 1 },
      },
    })
    if (!listing) return jsonError("Listing not found", 404)    // Seller-only decision: proceed with the current highest offer (timed offers only)
    if (listing.sellerId !== session.user.id) return jsonError("Only the seller can proceed with an offer on this listing.", 403)

    // Only timed offers
    if (listing.type !== "AUCTION") return jsonError("This action is only available on timed offers listings.", 400)

    // Must be ended
    const h = hoursUntil(listing.endsAt)
    const isEnded = listing.status !== "ACTIVE" || (typeof h === "number" && h <= 0)
    if (!isEnded) return jsonError("Listing has not ended yet.", 400)

    // Must have a highest offer
    const top = listing.bids?.length ? listing.bids[0] : null
    if (!top || typeof top.amount !== "number" || !top.bidderId) return jsonError("No offers to proceed with.", 400)

    const amount = top.amount
    const buyerId = top.bidderId

    const result = await prisma.$transaction(async (tx) => {
      // Race-safe: only the first request that flips ACTIVE->SOLD may create an order
      const updated = await tx.listing.updateMany({
        where: { id: listing.id, status: { in: ["ACTIVE","ENDED"] } },
        data: { status: "SOLD" },
      })

      if (updated.count !== 1) {
        // Idempotency: if an order already exists for this listing, return it
        const existing = await tx.order.findFirst({
          where: {
              listingId: listing.id,
              OR: [
                { status: "PENDING" },
                { status: "PAID" },
                { outcome: "COMPLETED" },
              ],
            },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })
        if (existing) return { order: { id: existing.id } }

        throw new Error("LISTING_NOT_ACTIVE")
      }

      const order = await tx.order.create({
        data: {
          amount,
          status: "PENDING",
          outcome: "PENDING",
          buyerId,
          listingId: listing.id,
        },
      })

      return { order }
    })

    return NextResponse.json({ ok: true, orderId: result.order.id })
  } catch (e: any) {
    console.error("Accept highest offer error:", e)

    if (e?.message === "LISTING_NOT_ACTIVE") {
      return jsonError("Listing is not active.", 400)
    }

    return jsonError("Server error", 500)
  }
}
