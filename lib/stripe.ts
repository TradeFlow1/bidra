import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Intentionally omit apiVersion to avoid type mismatches between Stripe SDK versions.
  // Stripe will use the account's default API version.
});
