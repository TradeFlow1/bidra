import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";
import { applyPolicyStrike, isPolicyBlocked } from "@/lib/policy-strike";
import { FULL_CATEGORIES } from "@/lib/categories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const;

function sanitizeDescription(input: string): string {
  const raw = String(input || "");
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

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
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

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    const pb = await isPolicyBlocked(session.user.id);
    if (pb.blocked) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }

    const id = String(ctx?.params?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing listing id" }, { status: 400 });

    const existing = await prisma.listing.findUnique({
      where: { id: id },
      select: { id: true, sellerId: true, status: true, type: true, buyNowPrice: true },
    });

    if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (existing.sellerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const title = String(body.title || "").trim();
    const description = sanitizeDescription(String(body.description || "").trim());
    const category = String(body.category || "").trim();
    const tags = Array.isArray((body as any)?.tags) ? (body as any).tags : null;
    const condition = String(body.condition || "Used").trim();
    const location = normalizeLocation(String(body.location || "").trim() || defaultLocation);
    const price = Number(body.price);

    const imagesRaw = Array.isArray(body.images) ? body.images : [];
    const images = imagesRaw.map(function (v: any) { return String(v ?? "").trim(); }).filter(Boolean).slice(0, 10);

    const buyNowPriceIn = body?.buyNowPrice;
    const hasBuyNowField = Object.prototype.hasOwnProperty.call(body ?? {}, "buyNowPrice");

    const statusRaw = body?.status == null ? "" : String(body.status).trim();
    const status = statusRaw ? statusRaw.toUpperCase() : "";

    if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
    if (!(FULL_CATEGORIES as readonly string[]).includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
    if (!location) return NextResponse.json({ error: "Location is required. Please set your Account location (postcode + suburb + state) and try again." }, { status: 400 });
    if (!isValidAuLocation(location)) return NextResponse.json({ error: "Invalid location. Use format like: 4000 Brisbane, QLD (postcode + suburb + state)." }, { status: 400 });
    if (images.length > 10) return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });
    if (status && !(SELLER_ALLOWED_STATUSES as readonly string[]).includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    if (images.some(function (u: string) {
      const s = String(u ?? "").trim().toLowerCase();
      if (!s) return false;
      if (!s.startsWith("https://")) return true;
      if (s.indexOf("vercel-storage.com/") < 0) return true;
      return false;
    })) {
      return NextResponse.json({ error: "Images must be uploaded via Bidra (invalid image URL)." }, { status: 400 });
    }

    if (listingLooksProhibited({ title, description, category, tags, images })) {
      try {
        await prisma.adminEvent.create({
          data: {
            type: "LISTING_POLICY_BLOCKED_UPDATE",
            userId: session.user.id,
            data: { listingId: id, title: title, category: category },
          },
        });
      } catch (_auditErr) {}

      const strike = await applyPolicyStrike(session.user.id);
      return NextResponse.json(
        {
          error: "This item is not permitted to be listed.",
          policy: { strikes: strike.strikes, blockedUntil: strike.blockedUntil },
        },
        { status: 400 }
      );
    }

    const data: any = {
      title: title,
      description: description,
      category: category,
      condition: condition,
      location: location,
      price: price,
      images: images,
    };

    if (existing.type === "BUY_NOW") {
      data.buyNowPrice = price;
      data.buyNowEnabled = true;
    } else if (hasBuyNowField) {
      if (buyNowPriceIn === null || buyNowPriceIn === "") {
        data.buyNowPrice = null;
        data.buyNowEnabled = false;
      } else {
        const nextBuyNow = Math.round(Number(buyNowPriceIn));
        if (!Number.isFinite(nextBuyNow) || nextBuyNow <= 0) {
          return NextResponse.json({ error: "Invalid buyNowPrice" }, { status: 400 });
        }
        data.buyNowPrice = nextBuyNow;
        data.buyNowEnabled = true;
      }
    }

    if (status) data.status = status;

    const listing = await prisma.listing.update({
      where: { id: id },
      data: data,
    });

    return NextResponse.json({ listing: listing });
  } catch (e: any) {
    console.error("Update listing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}