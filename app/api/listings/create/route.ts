import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";
import { isPolicyBlocked } from "@/lib/policy-strike";
import { FULL_CATEGORIES } from "@/lib/categories";

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

function normalizeType(raw: any): "BUY_NOW" | "OFFERABLE" {
  const t = String(raw || "").trim().toUpperCase();
  if (t === "OFFERABLE") return "OFFERABLE";
  return "BUY_NOW";
}

function toIntOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return Math.trunc(n);
}

function normalizeLocation(input: string): string {
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

function isValidAuLocation(s: string): boolean {
  const v = String(s || "").trim();
  if (!v) return false;
  const m = v.match(/^(\d{4})\s+(.+?),\s*([A-Za-z]{2,3})$/);
  if (!m) return false;
  const st = m[3].toUpperCase();
  const ok = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);
  return ok.has(st);
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
    const session = gate.session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { postcode: true, suburb: true, state: true },
    });

    const defaultLocation =
      me?.postcode && me?.suburb && me?.state
        ? `${String(me.postcode).trim()} ${String(me.suburb).trim()}, ${String(me.state).trim()}`
        : "";

    const pb = await isPolicyBlocked(session.user.id);
    if (pb.blocked) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(function () { return {}; });

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const tags = Array.isArray((body as any)?.tags) ? (body as any).tags : null;
    const condition = String(body.condition || "Used").trim();
    const location = normalizeLocation(String(body.location || "").trim() || defaultLocation);
    const type = normalizeType(body.type);

    const startingBidIn = toIntOrNull(body.startingBid);
    const reservePriceIn = toIntOrNull(body.reservePrice);
    const durationDaysIn = toIntOrNull(body.durationDays);
    const rawPriceIn = toIntOrNull(body.price);
    const priceIn = type === "OFFERABLE" ? startingBidIn : rawPriceIn;
    const buyNowPriceIn = toIntOrNull(body.buyNowPrice);

    const imagesRaw = Array.isArray(body.images) ? body.images : [];


    const images = imagesRaw.map(function (v: any) { return String(v ?? "").trim(); }).filter(Boolean).slice(0, 10);

    if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
    if (!(FULL_CATEGORIES as readonly string[]).includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    if (!location) return NextResponse.json({ error: "Location is required. Please set your Account location (postcode + suburb + state) and try again." }, { status: 400 });
    if (!isValidAuLocation(location)) return NextResponse.json({ error: "Invalid location. Use format like: 4000 Brisbane, QLD (postcode + suburb + state)." }, { status: 400 });
    if (images.length > 10) return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });


    if (type === "BUY_NOW") {
      if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
    } else {
      if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) return NextResponse.json({ error: "Starting offer must be greater than 0." }, { status: 400 });
      if (Number.isNaN(reservePriceIn)) return NextResponse.json({ error: "Reserve must be a number or blank." }, { status: 400 });
      if (reservePriceIn !== null) return NextResponse.json({ error: "Reserve is not supported in this launch version." }, { status: 400 });
      if (durationDaysIn === null || Number.isNaN(durationDaysIn) || !(durationDaysIn === 3 || durationDaysIn === 5 || durationDaysIn === 7)) return NextResponse.json({ error: "Timed offers duration must be 3, 5, or 7 days." }, { status: 400 });
    }

    if (Number.isNaN(buyNowPriceIn)) return NextResponse.json({ error: "Buy Now must be a number or blank." }, { status: 400 });
    if (type === "OFFERABLE" && buyNowPriceIn !== null && buyNowPriceIn <= 0) return NextResponse.json({ error: "Buy Now must be greater than 0 (or blank)." }, { status: 400 });
    if (type === "OFFERABLE" && buyNowPriceIn !== null && buyNowPriceIn < priceIn) return NextResponse.json({ error: "Buy Now must be at least the starting offer." }, { status: 400 });

    if (images.some(function (u: string) {
      const s = String(u || "").toLowerCase();
      if (!s.startsWith("https://")) return true;
      if (!s.includes("vercel-storage.com/")) return true;
      return false;
    })) {
      return NextResponse.json({ error: "Images must be uploaded via Bidra (invalid image URL)." }, { status: 400 });
    }

    if (listingLooksProhibited({ title, description, category, tags, images })) {
      try {
        await prisma.adminEvent.create({
          data: {
            type: "LISTING_POLICY_BLOCKED_CREATE",
            userId: session.user.id,
            data: { title: title, category: category },
          },
        });
      } catch (_auditErr) {}

      return NextResponse.json(
        {
          error: "This item is not permitted to be listed.",
          policy: { strikes: null, blockedUntil: null },
        },
        { status: 400 }
      );
    }

    const buyNowToSave = type === "BUY_NOW"
      ? priceIn
      : (buyNowPriceIn === null ? null : buyNowPriceIn);

    const listing = await prisma.listing.create({
      data: {
        type: type,
        title: title,
        description: sanitizeDescription(description),
        category: category,
        condition: condition,
        location: location,
        price: priceIn as number,
        images: images,
        buyNowPrice: buyNowToSave,
        buyNowEnabled: type === "BUY_NOW" ? true : (buyNowToSave !== null),
        sellerId: session.user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ listing: listing });
  } catch (e: any) {
    console.error("Create listing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
