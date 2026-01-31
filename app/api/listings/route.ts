import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_PRICE_CENTS = 1000000 * 100; // $1,000,000 AUD sanity cap (cents)

const __g: any = globalThis as any;
function shouldRunExpirySweep(nowMs: number, minEveryMs: number) {
  const k = "__bidra_expiry_sweep_ms";
  const last = typeof __g[k] === "number" ? __g[k] : 0;
  if (last && nowMs - last < minEveryMs) return false;
  __g[k] = nowMs;
  return true;
}

function norm(s: any) {
  return String(s ?? "").trim().toLowerCase();
}

function sanitizeTitle(title: any) {
  const t = String(title ?? "").trim();
  if (!t) return t;
  // ultra-conservative public feed fixes (do NOT rewrite meaning)
  // Example: "Fish tand" -> "Fish tank"
  return t
    .replace(/\bFish\s+tand\b/gi, "Fish tank")
    .replace(/\s{2,}/g, " ");
}
function scoreListing(listing: any, user: { postcode?: string | null; suburb?: string | null; state?: string | null } | null) {
  if (!user) return 0;
  const loc = norm(listing?.location);
  const pc = norm(user.postcode);
  const sub = norm(user.suburb);
  const st = norm(user.state);

  let score = 0;
  if (pc && loc.includes(pc)) score += 3;
  if (sub && loc.includes(sub)) score += 2;
  if (st && loc.includes(st)) score += 1;
  return score;
}

function dailySeed(userId: string) {
  const d = new Date();
  const day = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  // simple hash
  const str = `${day}:${userId}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

function seededRand(seed: number) {
  // xorshift32
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wantLocal = url.searchParams.get("local") === "1";

    // If local requested, try to get adult session.
    // If not signed in / not adult, we silently fall back to normal ordering.
    let meUserId: string | null = null;
    let userLoc: { postcode?: string | null; suburb?: string | null; state?: string | null } | null = null;

    if (wantLocal) {
      const gate = await requireAdult();
      if (gate?.ok) {
        meUserId = gate?.session?.user?.id ? String(gate.session.user.id) : null;
        if (meUserId) {
          userLoc = await prisma.user.findUnique({
            where: { id: meUserId },
            select: { postcode: true, suburb: true, state: true },
          });
        }
      }
    }

    const baseTake = wantLocal && meUserId ? 60 : 24;

    const now = new Date();

    // Self-heal: expire timed-offer listings that passed their end time.
    // IMPORTANT: throttle this so bursts don't hammer DB with updateMany on every request.
    if (shouldRunExpirySweep(Date.now(), 60000)) {
      await prisma.listing.updateMany({
        where: { status: "ACTIVE", endsAt: { lt: now } },
        data: { status: "ENDED" },
      });
    }

    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        
        images: { isEmpty: false },
        // Safety: never return listings that already have an order
        orders: { none: {} },
        // Sanity: hide implausible prices from public feeds
        price: { lte: MAX_PRICE_CENTS },
        AND: [
          { OR: [{ buyNowPrice: null }, { buyNowPrice: { lte: MAX_PRICE_CENTS } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
        NOT: [
          { title: { equals: "test", mode: "insensitive" } },
          { title: { startsWith: "test", mode: "insensitive" } },
          { title: { contains: "dfgh", mode: "insensitive" } },
          { title: { contains: "asdf", mode: "insensitive" } },
          { title: { contains: "qwer", mode: "insensitive" } },
          { title: { contains: "no photos", mode: "insensitive" } },
          { title: { contains: "no photo", mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        type: true,
        images: true,
        price: true,
        buyNowPrice: true,
        category: true,
        condition: true,
        createdAt: true,
      },
      take: baseTake,
    });

    if (wantLocal && meUserId && userLoc) {
      const seed = dailySeed(meUserId);
      const rnd = seededRand(seed);

      const ranked = listings
        .map((l: any) => ({ l, s: scoreListing(l, userLoc) }))
        .sort((a: any, b: any) => {
          if (b.s !== a.s) return b.s - a.s;
          // within same score, rotate daily
          const ra = rnd();
          const rb = rnd();
          if (ra < rb) return -1;
          if (ra > rb) return 1;
          // final tie-breaker: newest first
          return new Date(b.l.createdAt).getTime() - new Date(a.l.createdAt).getTime();
        })
        .map((x: any) => x.l)
        .slice(0, 24);

      return NextResponse.json({ listings: ranked.map((l: any) => ({ ...l, title: sanitizeTitle(l.title) })) }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ listings: listings.map((l: any) => ({ ...l, title: sanitizeTitle(l.title) })) }, { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("GET /api/listings failed", err);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}
