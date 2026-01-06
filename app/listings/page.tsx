export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FULL_CATEGORIES } from "@/lib/categories";
import WatchButton from "@/components/watch-button";
import ListingCard from "@/components/listing-card";
import MobileFiltersToggle from "@/components/mobile-filters-toggle";

type SearchParams = {
  q?: string;
  category?: string;
  type?: string;
  condition?: string;
  location?: string;
  min?: string;
  max?: string;
  sort?: string;
};

function dollars(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toFixed(2);
}

function parseMoneyToCents(input: string | null | undefined) {
  const s = (input ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

function cleanStr(v: string | null | undefined) {
  const s = (v ?? "").trim();
  return s.length ? s : "";
}

function firstImage(images: string[] | null | undefined) {
  if (!images || !images.length) return null;
  const u = (images[0] ?? "").trim();
  return u.length ? u : null;
}

function endsLabel(endsAt: Date | null | undefined) {
  if (!endsAt) return null;
  const ms = endsAt.getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Ended";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `Ends in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `Ends in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Ends in ${days}d`;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = cleanStr(searchParams?.q);
  const category = cleanStr(searchParams?.category);
  const type = cleanStr(searchParams?.type);
  const condition = cleanStr(searchParams?.condition);
  const location = cleanStr(searchParams?.location);
  const sort = cleanStr(searchParams?.sort);

  const minCents = parseMoneyToCents(searchParams?.min);
  const maxCents = parseMoneyToCents(searchParams?.max);

  const moneyErr = Number.isNaN(minCents as any) || Number.isNaN(maxCents as any);

  const where: any = { AND: [] as any[] };

  // Always hide DELETED/SUSPENDED/etc from public browse
  where.AND.push({ status: "ACTIVE" });

  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (category) where.AND.push({ category });
  if (type) where.AND.push({ type });
  if (condition) where.AND.push({ condition });

  if (location) {
    where.AND.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (!moneyErr) {
    if (typeof minCents === "number") where.AND.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") where.AND.push({ price: { lte: maxCents } });
  }

  const finalWhere = where.AND.length ? where : undefined;

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "ending_soon"
      ? { endsAt: "asc" }
      : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where: finalWhere,
    orderBy,
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      type: true,
      condition: true,
      price: true,
      buyNowPrice: true,
      reservePrice: true,
      endsAt: true,
      createdAt: true,
      images: true,
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true },
      },
      _count: {
        select: { bids: true },
      },
    },
  });

  // Watch status (single query)
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watched = await prisma.watchlist.findMany({
      where: { userId, listingId: { in: listings.map((l) => l.id) } },
      select: { listingId: true },
    });
    watched.forEach((w) => watchedSet.add(w.listingId));
  }

  const hasAnyFilter = !!(
    q ||
    category ||
    type ||
    condition ||
    location ||
    (searchParams?.min ?? "").trim() ||
    (searchParams?.max ?? "").trim() ||
    sort
  );

  /* STEP3_FILTERS_CLEAN: replace inline filter styles with bd-input / bd-label */

  return (
    <main>
      <div className="bd-container">
        <section className="section" style={{ paddingTop: 18, paddingBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="h1" style={{ fontSize: 28 }}>Browse</h1>
              <p className="p" style={{ marginTop: 6 }}>
                {hasAnyFilter ? <>Showing results ({listings.length})</> : <>Showing latest listings ({listings.length})</>}
              </p>
            </div>
          </div>

          <div className="bd-card p-4 mt-3">
            <MobileFiltersToggle>
<form action="/listings" method="get">
  <div className="grid gap-3 md:grid-cols-12">
    <div className="md:col-span-3">
      <div className="bd-label text-xs">Search</div>
      <input name="q" defaultValue={q} placeholder="Search listings" className="bd-input" />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Category</div>
      <select name="category" defaultValue={category} className="bd-input">
        <option value="">All categories</option>
        {FULL_CATEGORIES.map((c: string) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Type</div>
      <select name="type" defaultValue={type} className="bd-input">
        <option value="">Any</option>
        <option value="BUY_NOW">Buy Now</option>
        <option value="FIXED_PRICE">Fixed price</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Condition</div>
      <select name="condition" defaultValue={condition} className="bd-input">
        <option value="">Any</option>
        <option value="New">New</option>
        <option value="Used - Like New">Used - Like New</option>
        <option value="Used - Good">Used - Good</option>
        <option value="Used - Fair">Used - Fair</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Sort</div>
      <select name="sort" defaultValue={sort} className="bd-input">
        <option value="">Newest</option>
        <option value="ending_soon">Ending soon</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  </div>

  <div className="mt-3 grid gap-3 md:grid-cols-12">
    <div className="md:col-span-6">
      <div className="bd-label text-xs">Location</div>
      <input name="location" defaultValue={location} placeholder="Location" className="bd-input" />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Min ($)</div>
      <input
        name="min"
        defaultValue={(searchParams?.min ?? "").trim()}
        placeholder="Min"
        className="bd-input"
        inputMode="decimal"
      />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Max ($)</div>
      <input
        name="max"
        defaultValue={(searchParams?.max ?? "").trim()}
        placeholder="Max"
        className="bd-input"
        inputMode="decimal"
      />
    </div>
  </div>

  {moneyErr ? (
    <div style={{ color: "#b91c1c", fontWeight: 900, fontSize: 13, marginTop: 10 }}>
      Price filters must be numbers (example: 10 or 10.50).
    </div>
  ) : null}

  <div className="mt-3 flex flex-wrap items-center gap-2">
    <button type="submit" className="btnPrimary" style={{ cursor: "pointer" }}>
      Apply
    </button>
    {hasAnyFilter ? (
      <Link href="/listings" className="btnSecondary">Clear</Link>
    ) : null}
  </div>
</form>
</MobileFiltersToggle>

<div className="hidden md:block">
<form action="/listings" method="get">
  <div className="grid gap-3 md:grid-cols-12">
    <div className="md:col-span-3">
      <div className="bd-label text-xs">Search</div>
      <input name="q" defaultValue={q} placeholder="Search listings" className="bd-input" />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Category</div>
      <select name="category" defaultValue={category} className="bd-input">
        <option value="">All categories</option>
        {FULL_CATEGORIES.map((c: string) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Type</div>
      <select name="type" defaultValue={type} className="bd-input">
        <option value="">Any</option>
        <option value="BUY_NOW">Buy Now</option>
        <option value="FIXED_PRICE">Fixed price</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Condition</div>
      <select name="condition" defaultValue={condition} className="bd-input">
        <option value="">Any</option>
        <option value="New">New</option>
        <option value="Used - Like New">Used - Like New</option>
        <option value="Used - Good">Used - Good</option>
        <option value="Used - Fair">Used - Fair</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <div className="bd-label text-xs">Sort</div>
      <select name="sort" defaultValue={sort} className="bd-input">
        <option value="">Newest</option>
        <option value="ending_soon">Ending soon</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  </div>

  <div className="mt-3 grid gap-3 md:grid-cols-12">
    <div className="md:col-span-6">
      <div className="bd-label text-xs">Location</div>
      <input name="location" defaultValue={location} placeholder="Location" className="bd-input" />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Min ($)</div>
      <input
        name="min"
        defaultValue={(searchParams?.min ?? "").trim()}
        placeholder="Min"
        className="bd-input"
        inputMode="decimal"
      />
    </div>

    <div className="md:col-span-3">
      <div className="bd-label text-xs">Max ($)</div>
      <input
        name="max"
        defaultValue={(searchParams?.max ?? "").trim()}
        placeholder="Max"
        className="bd-input"
        inputMode="decimal"
      />
    </div>
  </div>

  {moneyErr ? (
    <div style={{ color: "#b91c1c", fontWeight: 900, fontSize: 13, marginTop: 10 }}>
      Price filters must be numbers (example: 10 or 10.50).
    </div>
  ) : null}

  <div className="mt-3 flex flex-wrap items-center gap-2">
    <button type="submit" className="btnPrimary" style={{ cursor: "pointer" }}>
      Apply
    </button>
    {hasAnyFilter ? (
      <Link href="/listings" className="btnSecondary">Clear</Link>
    ) : null}
  </div>
</form>
</div>
          </div>

          <div className="browseList w-full grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.length === 0 ? (
              <div className="card" style={{ opacity: 0.9 }}>
                <p className="cardBody" style={{ margin: 0 }}>No listings found.</p>
              </div>
            ) : (
              listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={{
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    price: (l.type === "AUCTION"
                      ? ((l.bids && l.bids.length ? l.bids[0].amount : null) ?? l.price)
                      : (l.buyNowPrice ?? l.price)
                    ) as any,
                    buyNowPrice: l.buyNowPrice,
                    type: l.type,
                    category: l.category,
                    location: l.location,
                    images: (l as any).images ?? null,
                  }}
                  initiallyWatched={typeof watchedSet !== "undefined" ? watchedSet.has(l.id) : false}
                />
              )))}
          </div>
        </section>
      </div>
    </main>
  );
}
