import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";
import { applyPolicyStrike, isPolicyBlocked } from "@/lib/policy-strike";
import { FULL_CATEGORIES } from "@/lib/categories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const;

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    // If currently blocked (policy ladder)
    const pb = await isPolicyBlocked(session.user.id);
    if (pb.blocked) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }

    const id = String(ctx?.params?.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
    }

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, status: true, type: true, buyNowPrice: true, endsAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const title = String(body.title || "").trim();
    function sanitizeDescription(input: string): string {
      const raw = String(input ?? "");
      const lines = raw.split(/\r?\n/);

      const cleaned = lines.filter((ln) => {
        const s = String(ln ?? "").trim();
        if (!s) return true;

        // Remove ONLY the template placeholder line(s)
        // e.g. "- Included: (add what’s included)" / "- Included: (add what's included)"
        const t = s
          .replace(/^[-*]\s*/, "")
          .replace(/\s+/g, " ")
          .toLowerCase();

        return t !== "included: (add what’s included)".toLowerCase() &&
               t !== "included: (add what's included)".toLowerCase();
      });

      return cleaned.join("\n").trim();
    }

    const description = sanitizeDescription(String(body.description || "").trim());
    const category = String(body.category || "").trim();
    const condition = String(body.condition || "Used").trim();
    function normalizeLocation(input: string) {
      const raw = String(input ?? "");
      const s = raw.replace(/\s+/g, " ").trim();
      if (!s) return "";

      let m = s.match(/^(\d{4})\s+(.+?),\s*([A-Za-z]{2,3})$/);
      if (m) return `${m[1]} ${m[2].trim()}, ${m[3].trim().toUpperCase()}`;

      m = s.match(/^(\d{4})\s+(.+?)\s+([A-Za-z]{2,3})$/);
      if (m) return `${m[1]} ${m[2].trim()}, ${m[3].trim().toUpperCase()}`;

      m = s.match(/^(.+?),\s*([A-Za-z]{2,3})\s+(\d{4})$/);
      if (m) return `${m[3]} ${m[1].trim()}, ${m[2].trim().toUpperCase()}`;

      return s;
    }
    const location = normalizeLocation(String(body.location || ""));
    const price = Number(body.price);
    const imagesRaw = Array.isArray(body.images) ? body.images : [];
const images = imagesRaw
  .map((v: any) => String(v ?? "").trim())
  .filter(Boolean)
  .slice(0, 10);

// ---- POLICY ENFORCEMENT (with strikes) ----
if (listingLooksProhibited({ title, description, category, images })) {
  const strike = await applyPolicyStrike(session.user.id);

  // audit (best-effort)
  try {
    await prisma.adminEvent.create({
      data: {
        type: "LISTING_POLICY_BLOCKED_UPDATE",
        userId: session.user.id,
        data: {
          strikes: strike.strikes,
          blockedUntil: strike.blockedUntil ? new Date(strike.blockedUntil).toISOString() : null,
          listingId: id,
          title,
          category,
          at: new Date().toISOString(),
        },
      },
    });
  } catch (e) {
    console.warn("[ADMIN_AUDIT] Failed to log LISTING_POLICY_BLOCKED_UPDATE", e);
  }

  return NextResponse.json(
    {
      error: "This item is not permitted to be listed.",
      policy: { strikes: strike.strikes, blockedUntil: strike.blockedUntil },
    },
    { status: 400 }
  );
}

// Hard guard: images must be uploaded via Bidra (Vercel Blob only).
// Disallow pasted external URLs and insecure schemes.
if (images.some((u: string) => {
  const s = String(u ?? "").trim().toLowerCase();
  if (!s) return false;
  if (!s.startsWith("https://")) return true;
  if (s.indexOf("vercel-storage.com/") < 0) return true;
  return false;
})) {
  return NextResponse.json({ error: "Images must be uploaded via Bidra (invalid image URL)." }, { status: 400 });
}

// Optional: timed-offers late-stage Buy Now (cents). Allow null to clear.
    const buyNowPriceIn = body?.buyNowPrice;
    const hasBuyNowField = Object.prototype.hasOwnProperty.call(body ?? {}, "buyNowPrice");

    const statusRaw = body?.status == null ? "" : String(body.status).trim();
    const status = statusRaw ? statusRaw.toUpperCase() : "";

    if (title.length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }
    if (!(FULL_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
    }
    if (images.length > 10) {
      return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });
    }

    if (status && !(SELLER_ALLOWED_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const data: any = { title, description, category, condition, location, price, images };

// Timed-offers Buy Now: only allow for schema type AUCTION listings. Ignore for other types.
if (hasBuyNowField) {
  const isTimedOffers = String((existing as any).type || "").toUpperCase() === "AUCTION";

// FIXED_PRICE: keep canonical price aligned (prevents drift between price and buyNowPrice)
if (!isTimedOffers) {
  data.buyNowPrice = price;
  data.buyNowEnabled = true;
  data.reservePrice = null;
}

  if (!isTimedOffers) {
    // ignore silently (do not error) to avoid breaking older clients
  } else {
    // Server guard: only allow setting Buy Now in the final 24h window of a timed-offers listing.
    const endsAt = (existing as any)?.endsAt ? new Date((existing as any).endsAt).getTime() : null;
    const hoursLeft = endsAt == null ? null : (endsAt - Date.now()) / (1000 * 60 * 60);
    const inFinalWindow = typeof hoursLeft === "number" && hoursLeft > 0 && hoursLeft <= 24;

    if (buyNowPriceIn === null) {
      data.buyNowPrice = null; // clear (allowed any time)
    } else if (typeof buyNowPriceIn === "number") {
      if (!inFinalWindow) {
        return NextResponse.json({ error: "Buy Now can only be enabled in the final 24 hours." }, { status: 400 });
      }
      if (!Number.isFinite(buyNowPriceIn) || buyNowPriceIn <= 0) {
        return NextResponse.json({ error: "Buy Now must be greater than 0." }, { status: 400 });
      }

      // Must be above current highest offer at time of save.
      const highest = await prisma.bid.findFirst({
        where: { listingId: id },
        orderBy: { amount: "desc" },
        select: { amount: true },
      });
      const highestCents = highest?.amount ?? 0;

      const nextBuyNow = Math.round(buyNowPriceIn);
      if (nextBuyNow <= highestCents) {
        return NextResponse.json({ error: "Buy Now must be above the current highest offer." }, { status: 400 });
      }

      data.buyNowPrice = nextBuyNow;
    } else {
      return NextResponse.json({ error: "Invalid buyNowPrice" }, { status: 400 });
    }
  }
}
    if (status) data.status = status;

    const listing = await prisma.listing.update({
      where: { id },
      data,
    });

    return NextResponse.json({ listing });
  } catch (e: any) {
    console.error("Update listing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
