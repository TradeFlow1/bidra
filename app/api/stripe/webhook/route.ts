import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If you haven't configured Stripe yet, we fail gracefully at runtime,
  // but we DO NOT break builds.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not set" },
      { status: 500 }
    );
  }
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Stripe needs the raw body to verify signatures.
  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message ?? "Unknown error"}` },
      { status: 400 }
    );
  }

  // TODO: Handle the event types you care about.
  // Keep this minimal for now so the endpoint exists and the app can deploy.
  // Example:
  // if (event.type === "checkout.session.completed") { ... }

  return NextResponse.json({ received: true });
}
