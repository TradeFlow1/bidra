import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;

  // IMPORTANT:
  // Do NOT initialize Stripe at import-time.
  // Vercel runs "collect page data" during build and will execute imports.
  // If STRIPE_SECRET_KEY isn't set at build time, Stripe throws and the build fails.
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  if (!_stripe) {
    _stripe = new Stripe(key, {
      // Intentionally omit apiVersion to avoid SDK literal-type mismatches.
      // Stripe uses the account default API version.
    });
  }

  return _stripe;
}

/**
 * Backwards-compatible export for code that does: `import { stripe } from "@/lib/stripe"`
 * This Proxy delays real initialization until a property is accessed.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe() as unknown as Record<PropertyKey, unknown>;
    return client[prop];
  },
}) as Stripe;
