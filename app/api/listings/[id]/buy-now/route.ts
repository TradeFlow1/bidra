import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { sendBuyNowPlacedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return jsonError("Sign in required before using Buy Now.", 401);

    const adult = await requireAdult(session);
    if (!adult.ok) return jsonError("Your account is not eligible to use Buy Now.", 403);

    const id = String(ctx?.params?.id || "").trim();
    if (!id) return jsonError("Listing id is required before using Buy Now.", 400);

    const listing = await prisma.listing.findUnique({
      where: { id: id },
      include: {
        offers: { orderBy: { amount: "desc" }, take: 1 },
      },
    });

    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.status !== "ACTIVE") return jsonError("Buy Now is only available on active listings.", 400);

    const amount = listing.type === "BUY_NOW"
      ? listing.price
      : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : null);

    if (amount === null) {
      return jsonError("Buy Now is not available for this listing.", 400);
    }

    const highestOffer = listing.offers?.length ? listing.offers[0].amount : 0;
    if (highestOffer >= amount) {
      return jsonError("Buy Now is no longer available.", 400);
    }

    if (listing.sellerId === session.user.id) {
      return jsonError("You cannot Buy Now your own listing.", 400);
    }


    const result = await prisma.$transaction(async function (tx) {
      const updated = await tx.listing.updateMany({
        where: { id: listing.id, status: "ACTIVE" },
        data: { status: "SOLD" },
      });

      if (updated.count !== 1) {
        const existing = await tx.order.findFirst({
          where: { listingId: listing.id, buyerId: session.user.id, status: OrderStatus.PENDING },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (existing) return { order: { id: existing.id }, reusedExistingOrder: true };
        throw new Error("LISTING_NOT_ACTIVE");
      }

      const order = await tx.order.create({
        data: {
          amount: amount,
          status: OrderStatus.PENDING,
          outcome: "PENDING",
          buyerId: session.user.id,
          listingId: listing.id,

        },
      });

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
      } catch (_auditErr) {}

      return { order: order, reusedExistingOrder: false };
    });

    try {
      const orderId = String(result?.order?.id || "").trim();
      if (orderId) {
        const pair = await Promise.all([
          prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
          prisma.user.findUnique({ where: { id: listing.sellerId }, select: { email: true } }),
        ]);

        const buyerEmail = String(pair[0]?.email || "").trim();
        const sellerEmail = String(pair[1]?.email || "").trim();

        if (buyerEmail) {
          await sendBuyNowPlacedEmail({
            to: buyerEmail,
            orderId: orderId,
            listingTitle: (listing as unknown as { title?: string }).title || null,
            amountCents: amount,
            role: "BUYER",
          });
        }

        if (sellerEmail) {
          await sendBuyNowPlacedEmail({
            to: sellerEmail,
            orderId: orderId,
            listingTitle: (listing as unknown as { title?: string }).title || null,
            amountCents: amount,
            role: "SELLER",
          });
        }
      }
    } catch (_emailErr) {}

    return NextResponse.json({
      ok: true,
      orderId: result.order.id,
      nextStep: "Order created. Keep payment, pickup, postage, and handover arrangements in Bidra Messages.",
      reusedExistingOrder: !!result.reusedExistingOrder,
    });
  } catch (e: any) {
    console.error("Buy Now error:", e);

    if (e?.message === "LISTING_NOT_ACTIVE") {
      return jsonError("Buy Now is no longer available for this listing.", 400);
    }

    return jsonError("We could not create the order. Please try again.", 500);
  }
}