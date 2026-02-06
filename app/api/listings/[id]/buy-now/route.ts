/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"
import { sendBuyNowPlacedEmail } from "@/lib/email"

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
    const isTimedOffers = listing.type === "AUCTION"
const hasBuyNow = typeof listing.buyNowPrice === "number"
if (isTimedOffers && !hasBuyNow) return jsonError("Buy Now is not set for this timed-offers listing.", 400)

    const highestOffer = listing.bids?.length ? listing.bids[0].amount : 0

    const amount = isTimedOffers
      ? (listing.buyNowPrice as number)
      : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : listing.price)

    // Timed offers (schema type: AUCTION): Kevin model
    if (listing.type === "AUCTION") {
      if (!Boolean((listing as unknown as { buyNowEnabled?: unknown }).buyNowEnabled)) return jsonError("Buy Now is not enabled for this timed-offers listing.", 400)
      const h = hoursUntil(listing.endsAt)
      const isFinalWindow = typeof h === "number" ? h <= 24 : false
      if (!isFinalWindow) return jsonError("Buy Now may be enabled late-stage on timed offers.", 400)

      // Must be above current highest offer
      if (amount <= highestOffer) {
        return jsonError("Buy Now must be above the current highest offer.", 400)
      }
    }


    // Fixed price: primary path (allowed). Still prevent Buy Now if already met/exceeded by offers.
    if (highestOffer >= amount) {
      return jsonError("Buy Now is no longer available.", 400)
    }

    // Seller can't buy their own item
    if (listing.sellerId === session.user.id) return jsonError("You can’t Buy Now your own listing.", 400)


    const result = await prisma.$transaction(async (tx) => {
      // Race-safe: only the first request that flips ACTIVE->SOLD may create an order
      const updated = await tx.listing.updateMany({
        where: { id: listing.id, status: "ACTIVE" },
        data: { status: "SOLD" },
      })

      if (updated.count !== 1) {
        // Idempotency: if this buyer already created an order for this listing, return it
        const existing = await tx.order.findFirst({
          where: { listingId: listing.id, buyerId: session.user.id, status: "PENDING" },
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
          buyerId: session.user.id,
          listingId: listing.id,
        },
      })

       
      // Audit log: Buy Now placed (order created)
      try {
        await tx.adminEvent.create({
          data: {
            type: "BUY_NOW_PLACED",
            userId: session.user.id,
            orderId: order.id,
            data: {
              listingId: listing.id,
              buyerId: session.user.id,
              sellerId: listing.sellerId,
              amount: amount,
            },
          },
        });
      } catch (e) {
        console.warn("[ADMIN_AUDIT] Failed to log BUY_NOW_PLACED", e);
      }
return { order }
    })

    // Email notify buyer + seller (SES-gated; dev logs when disabled)
    try {
      const orderId = String(result?.order?.id || "").trim()
      if (orderId) {
        const [buyer, seller] = await Promise.all([
          prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
          prisma.user.findUnique({ where: { id: listing.sellerId }, select: { email: true } }),
        ])

        const buyerEmail = String(buyer?.email || "").trim()
        const sellerEmail = String(seller?.email || "").trim()

        if (buyerEmail) {
          await sendBuyNowPlacedEmail({
            to: buyerEmail,
            orderId,
            listingTitle: (listing as unknown as { title?: string })?.title || null,
            amountCents: amount,
            role: "BUYER",
          })
        }

        if (sellerEmail) {
          await sendBuyNowPlacedEmail({
            to: sellerEmail,
            orderId,
            listingTitle: (listing as unknown as { title?: string })?.title || null,
            amountCents: amount,
            role: "SELLER",
          })
        }
      }
    } catch (e) {
      console.warn("[EMAIL_NOTIFY] buy-now notify failed", e)
    }

    return NextResponse.json({ ok: true, orderId: result.order.id })
  } catch (e: any) {
    console.error("Buy Now error:", e)

    if (e?.message === "LISTING_NOT_ACTIVE") {
      return jsonError("Listing is not active.", 400)
    }

    return jsonError("Server error", 500)
  }
}

