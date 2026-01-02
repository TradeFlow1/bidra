import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
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
    if (!listing) return jsonError("Listing not found", 404)

    // Only timed bidding listings support Buy Now in our model
    if (listing.type !== "AUCTION") return jsonError("Buy Now is only available on timed bidding listings.", 400)

    if (listing.status !== "ACTIVE") return jsonError("Listing is not active.", 400)

    if (typeof listing.buyNowPrice !== "number") return jsonError("Buy Now is not set for this listing.", 400)

    const highestBid = listing.bids?.length ? listing.bids[0].amount : 0
    const currentOffer = Math.max(listing.price, highestBid)

    // Buy Now disappears once met/exceeded
    if (currentOffer >= listing.buyNowPrice) {
      return jsonError("Buy Now is no longer available.", 400)
    }

    // Seller can't buy their own item
    if (listing.sellerId === session.user.id) return jsonError("You can’t Buy Now your own listing.", 400)

    const amount = listing.buyNowPrice

    // Create an order + mark listing SOLD atomically
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id: listing.id },
        data: { status: "SOLD" },
      })

      const order = await tx.order.create({
        data: {
          amount,
          status: "PENDING",
          outcome: "PENDING",
          buyerId: session.user.id,
          listingId: listing.id,
        },
      })

      return { updated, order }
    })

    return NextResponse.json({ ok: true, orderId: result.order.id })
  } catch (e) {
    console.error("Buy Now error:", e)
    return jsonError("Server error", 500)
  }
}
