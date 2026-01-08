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
    if (!listing) return jsonError("Listing not found", 404)

    if (listing.status !== "ACTIVE") return jsonError("Listing is not active.", 400)

    // Buy Now price is stored in cents as listing.buyNowPrice
    if (typeof listing.buyNowPrice !== "number") return jsonError("Buy Now is not set for this listing.", 400)

    const highestOffer = listing.bids?.length ? listing.bids[0].amount : 0

    // Timed offers (schema type: AUCTION): Kevin model
    if (listing.type === "AUCTION") {
      if (!(listing as any).buyNowEnabled) return jsonError("Buy Now is not enabled for this timed-offers listing.", 400)
      const h = hoursUntil(listing.endsAt)
      const isFinalWindow = typeof h === "number" ? h <= 24 : false
      if (!isFinalWindow) return jsonError("Buy Now may be enabled late-stage on timed offers.", 400)

      // Must be above current highest offer
      if (listing.buyNowPrice <= highestOffer) {
        return jsonError("Buy Now must be above the current highest offer.", 400)
      }
    }

    // Fixed price: primary path (allowed). Still prevent Buy Now if already met/exceeded by offers.
    if (highestOffer >= listing.buyNowPrice) {
      return jsonError("Buy Now is no longer available.", 400)
    }

    // Seller can't buy their own item
    if (listing.sellerId === session.user.id) return jsonError("You can’t Buy Now your own listing.", 400)

    const amount = listing.buyNowPrice

    const result = await prisma.$transaction(async (tx) => {
      await tx.listing.update({
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

      return { order }
    })

    return NextResponse.json({ ok: true, orderId: result.order.id })
  } catch (e) {
    console.error("Buy Now error:", e)
    return jsonError("Server error", 500)
  }
}
