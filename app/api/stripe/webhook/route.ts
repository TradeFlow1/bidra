import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!sig || !secret) return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });

  const body = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session?.metadata?.orderId;
    if (orderId) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { listing: true } });
        if (!order) return;
        if (order.status === "PAID") return;

        await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

        // Mark listing sold for buy-now; for auction, also sold after payment
        await tx.listing.update({ where: { id: order.listingId }, data: { status: "SOLD" } });
      });
    }
  }

  return NextResponse.json({ received: true });
}
