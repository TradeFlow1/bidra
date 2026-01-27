import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";


import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";
import { applyPolicyStrike, isPolicyBlocked } from "@/lib/policy-strike";
import { FULL_CATEGORIES } from "@/lib/categories";


import { getFeedbackGate } from "@/lib/feedback-gate";

function sanitizeDescription(desc: string): string {
  const raw = String(desc || "");
  const lines = raw.split("\n");
  const keep: string[] = [];
  for (const l of lines) {
    const s = String(l || "").toLowerCase();
    const isPlaceholder =
      s.includes("included: (add") ||
      s.includes("reason for selling") ||
      s.includes("any marks or faults") ||
      s.includes("pickup location: (your suburb)");
    if (!isPlaceholder) keep.push(l);
  }
  return keep.join("\n").trim();
}



type ListingTypeIn = "AUCTION" | "BUY_NOW" | "FIXED_PRICE";

function isAllowedType(t: any): t is ListingTypeIn {
  return t === "AUCTION" || t === "BUY_NOW" || t === "FIXED_PRICE";
}

function toIntOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return Math.trunc(n);
}

export async function POST(req: Request) {
  
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }
try {
    const session = (gate as any).session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // If currently blocked (policy ladder)
    const pb = await isPolicyBlocked(session.user.id);
    if (pb.blocked) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }







    const body = await req.json().catch(() => ({}));

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const condition = String(body.condition || "Used").trim();
    function normalizeLocation(input: string) {
      const raw = String(input ?? "");
      const s = raw.replace(/\s+/g, " ").trim();
      if (!s) return "";

      // Already: "4000 Brisbane, QLD" -> ensure state upper
      let m = s.match(/^(\d{4})\s+(.+?),\s*([A-Za-z]{2,3})$/);
      if (m) return `${m[1]} ${m[2].trim()}, ${m[3].trim().toUpperCase()}`;

      // "4000 Brisbane QLD" -> add comma + upper state
      m = s.match(/^(\d{4})\s+(.+?)\s+([A-Za-z]{2,3})$/);
      if (m) return `${m[1]} ${m[2].trim()}, ${m[3].trim().toUpperCase()}`;

      // "Brisbane, QLD 4000" -> reorder
      m = s.match(/^(.+?),\s*([A-Za-z]{2,3})\s+(\d{4})$/);
      if (m) return `${m[3]} ${m[1].trim()}, ${m[2].trim().toUpperCase()}`;

      return s;
    }
    const location = normalizeLocation(String(body.location || ""));

    const typeRaw = body.type;
    const type: ListingTypeIn = isAllowedType(typeRaw) ? typeRaw : "FIXED_PRICE";

    const durationDaysRaw = (body as any).durationDays;
    const durationDaysNum = Number(durationDaysRaw);
    const allowedDurations = new Set([3, 5, 7, 10, 14]);
    const durationDays = allowedDurations.has(durationDaysNum) ? durationDaysNum : 7;

        const priceIn = toIntOrNull(body.price); // cents or null
    const startingOfferIn = toIntOrNull((body as any).startingOffer ?? (body as any).startingBid ?? (body as any).startingPrice); // cents or null
    const imagesRaw = Array.isArray(body.images) ? body.images : [];
const images = imagesRaw
  .map((v: any) => String(v ?? "").trim())
  .filter(Boolean)
  .slice(0, 10);

// Hard guard: we only accept upload-style URLs. Block insecure http://.
// Hard guard: we only accept upload-style URLs (Vercel Blob).
// Require https:// and vercel-storage.com host for every image URL.
if (images.some((u: string) => {
  const s = String(u || "").toLowerCase();
  if (!s.startsWith("https://")) return true;
  if (!s.includes("vercel-storage.com/")) return true;
  return false;
})) {
  return NextResponse.json({ error: "Images must be uploaded via Bidra (invalid image URL)." }, { status: 400 });
}

    const reservePrice = toIntOrNull(body.reservePrice); // cents or null
    const buyNowPrice = toIntOrNull(body.buyNowPrice);   // cents or null

    // ---- VALIDATION ----
    if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });

    if (!category) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }
    if (!(FULL_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    
    // Type-based price validation
    
    const isAuctionNow = type === "AUCTION";
    const isFixedNow = type === "FIXED_PRICE" || type === "BUY_NOW";

    if (isAuctionNow) {
      if (startingOfferIn === null || Number.isNaN(startingOfferIn) || startingOfferIn <= 0) {
        return NextResponse.json({ error: "Starting offer must be greater than 0." }, { status: 400 });
      }
    } else if (isFixedNow) {
      if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) {
        return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
      }
    }

if (images.length > 10) return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });

    if (Number.isNaN(reservePrice) || Number.isNaN(buyNowPrice)) {
      return NextResponse.json({ error: "Reserve/Buy Now must be a number or blank." }, { status: 400 });
    }

    // ---- POLICY ENFORCEMENT (with strikes) ----
    if (listingLooksProhibited({ title, description, category, images })) {
      const strike = await applyPolicyStrike(session.user.id);

      // audit (best-effort)
      try {
        await prisma.adminEvent.create({
          data: {
            type: "LISTING_POLICY_BLOCKED_CREATE",
            userId: session.user.id,
            data: {
              strikes: strike.strikes,
              blockedUntil: strike.blockedUntil ? new Date(strike.blockedUntil).toISOString() : null,
              title,
              category,
              at: new Date().toISOString(),
            },
          },
        });
      } catch (e) {
        console.warn("[ADMIN_AUDIT] Failed to log LISTING_POLICY_BLOCKED_CREATE", e);
      }

      return NextResponse.json(
        {
          error: "This item is not permitted to be listed.",
          policy: { strikes: strike.strikes, blockedUntil: strike.blockedUntil },
        },
        { status: 400 }
      );
    }

        const priceForRules = (type === "AUCTION" ? (startingOfferIn as number) : (priceIn as number));

    let reserveToSave: number | null = null;
    let buyNowToSave: number | null = null;

    if (isAuctionNow) {
      if (reservePrice !== null) {
        if (reservePrice <= 0) return NextResponse.json({ error: "Reserve price must be > 0 (or blank)." }, { status: 400 });
        if (reservePrice < priceForRules) return NextResponse.json({ error: "Reserve price must be >= starting price." }, { status: 400 });
        reserveToSave = reservePrice;
      }

      if (buyNowPrice !== null) {
        if (buyNowPrice <= 0) return NextResponse.json({ error: "Buy Now price must be > 0 (or blank)." }, { status: 400 });
        if (buyNowPrice < priceForRules) return NextResponse.json({ error: "Buy Now price must be >= starting price." }, { status: 400 });
        if (reserveToSave !== null && buyNowPrice < reserveToSave) {
          return NextResponse.json({ error: "Buy Now price must be >= reserve price." }, { status: 400 });
        }
        buyNowToSave = buyNowPrice;
      }
    } else if (isFixedNow) {
      reserveToSave = null;
      // Fixed price means Buy Now is the price
      buyNowToSave = priceForRules;
    }

    // Normalize legacy BUY_NOW to FIXED_PRICE
    const typeToSave = type === "BUY_NOW" ? "FIXED_PRICE" : type;

    // Default timed-offers duration: 7 days
    const now = new Date();
    const endsAtToSave = isAuctionNow ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;

    const listing = await prisma.listing.create({
      data: {
        type: typeToSave,
        title,
        description: sanitizeDescription(description),
        category,
        condition,
        location,
        price: priceForRules, images,
        reservePrice: reserveToSave,
        buyNowPrice: buyNowToSave,
        buyNowEnabled: isFixedNow ? true : false,
        endsAt: endsAtToSave,
        sellerId: session.user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ listing });
  } catch (e: any) {
    console.error("Create listing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
