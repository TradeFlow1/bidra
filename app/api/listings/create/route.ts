import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";

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

// Very lightweight policy layer (server-side). This is not perfect, but it’s enforceable and strike-backed.
const PROHIBITED_KEYWORDS = [
  // Live animals
  "kitten","puppy","dog","cat","rabbit","bird","snake","reptile","horse","livestock","animal","pet",
  "pup","kittens","puppies",
  // Weapons / restricted
  "gun","firearm","ammo","ammunition","rifle","pistol","shotgun","silencer",
  "switchblade","brass knuckles",
  // Drugs / controlled
  "cocaine","meth","ice","heroin","mdma","ecstasy","weed","marijuana","thc","vape thc"
];

function textLooksProhibited(text: string) {
  const t = (text || "").toLowerCase();
  return PROHIBITED_KEYWORDS.some((k) => t.includes(k));
}

async function applyStrike(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyStrikes: true, policyBlockedUntil: true },
  });

  const strikes = (user?.policyStrikes ?? 0) + 1;

  // Block ladder
  // 3 strikes -> 24 hours, 5 strikes -> 7 days
  let blockedUntil: Date | null = user?.policyBlockedUntil ?? null;
  const now = new Date();

  if (strikes >= 5) blockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  else if (strikes >= 3) blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      policyStrikes: strikes,
      policyBlockedUntil: blockedUntil,
    },
  });

  return { strikes, blockedUntil };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // If currently blocked
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { policyBlockedUntil: true },
    });

    if (me?.policyBlockedUntil && me.policyBlockedUntil.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }

    // Feedback enforcement (hard gate):
    // If you have pending feedback older than 48 hours, you cannot create new listings.
    const gate = await getFeedbackGate(session.user.id, 48);

    if (gate.blocked) {
      return NextResponse.json(
        {
          error: "Feedback required: please submit feedback to continue listing.",
          code: "FEEDBACK_REQUIRED",
          pendingCount: gate.pendingCount,
          orderId: gate.orderId,
          feedbackUrl: gate.feedbackUrl,
          graceHours: gate.graceHours,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "General").trim();
    const condition = String(body.condition || "Used").trim();
    const location = String(body.location || "").trim();

    const typeRaw = body.type;
    const type: ListingTypeIn = isAllowedType(typeRaw) ? typeRaw : "FIXED_PRICE";

    const price = Number(body.price); // cents
    const images = Array.isArray(body.images) ? body.images : [];

    const reservePrice = toIntOrNull(body.reservePrice); // cents or null
    const buyNowPrice = toIntOrNull(body.buyNowPrice);   // cents or null

    // ---- VALIDATION ----
    if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
    if (images.length > 10) return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });

    if (Number.isNaN(reservePrice) || Number.isNaN(buyNowPrice)) {
      return NextResponse.json({ error: "Reserve/Buy Now must be a number or blank." }, { status: 400 });
    }

    // ---- POLICY ENFORCEMENT (with strikes) ----
    const textToCheck = `${title} ${description} ${category}`.toLowerCase();
    if (textLooksProhibited(textToCheck)) {
      const strike = await applyStrike(session.user.id);
      return NextResponse.json(
        {
          error: "This item is not permitted to be listed.",
          policy: { strikes: strike.strikes, blockedUntil: strike.blockedUntil },
        },
        { status: 400 }
      );
    }

    const isAuction = type === "AUCTION";
    const isFixed = type === "FIXED_PRICE" || type === "BUY_NOW";

    let reserveToSave: number | null = null;
    let buyNowToSave: number | null = null;

    if (isAuction) {
      if (reservePrice !== null) {
        if (reservePrice <= 0) return NextResponse.json({ error: "Reserve price must be > 0 (or blank)." }, { status: 400 });
        if (reservePrice < price) return NextResponse.json({ error: "Reserve price must be >= starting price." }, { status: 400 });
        reserveToSave = reservePrice;
      }

      if (buyNowPrice !== null) {
        if (buyNowPrice <= 0) return NextResponse.json({ error: "Buy Now price must be > 0 (or blank)." }, { status: 400 });
        if (buyNowPrice < price) return NextResponse.json({ error: "Buy Now price must be >= starting price." }, { status: 400 });
        if (reserveToSave !== null && buyNowPrice < reserveToSave) {
          return NextResponse.json({ error: "Buy Now price must be >= reserve price." }, { status: 400 });
        }
        buyNowToSave = buyNowPrice;
      }
    } else if (isFixed) {
      reserveToSave = null;
      buyNowToSave = null;
    }

    // Normalize legacy BUY_NOW to FIXED_PRICE
    const typeToSave = type === "BUY_NOW" ? "FIXED_PRICE" : type;

    // Default auction duration: 7 days
    const now = new Date();
    const endsAtToSave = isAuction ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

    const listing = await prisma.listing.create({
      data: {
        type: typeToSave,
        title,
        description,
        category,
        condition,
        location,
        price,
        images,
        reservePrice: reserveToSave,
        buyNowPrice: buyNowToSave,
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