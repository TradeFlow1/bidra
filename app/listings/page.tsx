export const revalidate = 10;
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ListingType } from "@prisma/client";
import { FULL_CATEGORIES, CATEGORY_GROUPS , joinCategory} from "@/lib/categories";
import WatchButton from "@/components/watch-button";
import ListingCard from "@/components/listing-card";
import { isTimedOffersType } from "@/lib/listing-type";
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
  const remH = hrs - (days * 24); return `Ends in ${days}d ${remH}h`;
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

  // PERF: if no filters are set, use the cached public feed API (CDN) instead of Prisma.
  const hasAnyFilters =
    !!q || !!category || !!type || !!condition || !!location || !!searchParams?.min || !!searchParams?.max || !!sort;

  const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  const minCents = parseMoneyToCents(searchParams?.min);
  const maxCents = parseMoneyToCents(searchParams?.max);

  const moneyErr = Number.isNaN(Number(minCents)) || Number.isNaN(Number(maxCents));

  const and: Prisma.ListingWhereInput[] = [];
  const where: Prisma.ListingWhereInput = { AND: and };

  // BUCKET_A_P0: hide obvious test/gibberish listings from public browse
  and.push({
    NOT: [
      { title: { equals: "test", mode: "insensitive" } },
      { title: { startsWith: "test", mode: "insensitive" } },
      { title: { contains: "dfgh", mode: "insensitive" } },
      { title: { contains: "asdf", mode: "insensitive" } },
      { title: { contains: "qwer", mode: "insensitive" } },
      { title: { contains: "no photos", mode: "insensitive" } },
      { title: { contains: "no photo", mode: "insensitive" } }
    ],
  });

  // Always hide DELETED/SUSPENDED/etc from public browse
  and.push({ status: "ACTIVE" });
  // Hide expired timed-offer listings from public browse
  and.push({ OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] });

  // Safety: if an order exists for a listing, it must not be publicly browseable
  and.push({ orders: { none: {} } });

// NOTE: do NOT hide no-photo listings; UI already shows 'Photos coming soon'.

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

    if (category) {
    const isParent = CATEGORY_GROUPS.some((g) => g.parent === category);
    if (isParent) {
      and.push({
        OR: [
          { category: category },
          { category: { startsWith: category + " › " } },
        ],
      });
    } else {
      const legacyChild = category.includes(" › ") ? category.split(" › ").pop() : category;
      and.push({
        OR: [
          { category: category },
          { category: legacyChild },
        ],
      });
    }
  }
  if (type) and.push({ type: type as ListingType });
  if (condition) and.push({ condition });

  if (location) {
    and.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (!moneyErr) {
    if (typeof minCents === "number") and.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") and.push({ price: { lte: maxCents } });
  }

  const finalWhere = and.length ? where : undefined;

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "ending_soon"
      ? { endsAt: "asc" }
      : { createdAt: "desc" };

  let listings: any[] = [];

  if (!hasAnyFilters) {
    try {
      const res = await fetch(`${baseUrl}/api/listings`, {
        // Ensure we benefit from Vercel CDN caching rules set on the API route
        cache: "force-cache",
      });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data?.listings) ? data.listings : [];
        listings = arr;
      }
    } catch {
      // If API fetch fails, fall back to Prisma below (best effort)
    }
  }

  if (hasAnyFilters || !listings.length) {
  listings = await prisma.listing.findMany({
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
      offers: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true },
      },
      _count: {
        select: { offers: true },
      },
    },
  });
  }

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

  const resultsCount = listings.length;
  const showResultsText =
    resultsCount === 0 ? "No results" : hasAnyFilter ? "Update results" : "Show results";
  const clearText = resultsCount === 0 && hasAnyFilter ? "Clear filters" : "Clear";


  /* STEP3_FILTERS_CLEAN: replace inline filter styles with bd-input / bd-label */

  const FiltersForm = () => (
    <form action="/listings" method="get">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <div className="bd-label text-xs">Search</div>
          <input name="q" type="search" enterKeyHint="search" defaultValue={q} placeholder="Search listings" className="bd-input" />
          <button type="submit" className="sr-only" aria-hidden="true" tabIndex={-1}>Search</button>
        </div>

        <div className="md:col-span-3">
          <div className="bd-label text-xs">Category</div>
          <select name="category" defaultValue={category} className="bd-input">
            <option value="">All categories</option>
            {CATEGORY_GROUPS.map((g) => (
              <optgroup key={g.parent} label={g.parent}>
                <option value={g.parent}>{g.parent}</option>
                {g.children.map((c) => (
                  <option key={`${g.parent}:${c}`} value={joinCategory(g.parent, c)}>
                    {c}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="bd-label text-xs">Sale type</div>
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
          <input name="location" defaultValue={location} placeholder="Suburb, State" className="bd-input" />
        </div>

        <div className="md:col-span-3">
          <div className="bd-label text-xs">Min price (AUD)</div>
          <input
            name="min"
            defaultValue={(searchParams?.min ?? "").trim()}
            placeholder="Min price"
            className="bd-input"
            inputMode="decimal"
          />
        </div>

        <div className="md:col-span-3">
          <div className="bd-label text-xs">Max price (AUD)</div>
          <input
            name="max"
            defaultValue={(searchParams?.max ?? "").trim()}
            placeholder="Max price"
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
        <button type="submit" className="bd-btn bd-btn-primary">
          {showResultsText}
        </button>
        {hasAnyFilter ? (
          <Link href="/listings" className="bd-btn bd-btn-secondary">{clearText}</Link>
        ) : null}
      </div>
    </form>
  );


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
              <FiltersForm />
            </MobileFiltersToggle>

          <div className="hidden md:block">
            <FiltersForm />
          </div>
          </div>

          <div className="browseList w-full grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.length === 0 ? (
              <div className="card" style={{ opacity: 0.9 }}>
                <p className="cardBody" style={{ margin: 0 }}>No listings found. Try changing filters or searching again.</p>
              </div>
            ) : (
              listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={{
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    price: (isTimedOffersType(l.type)
                      ? ((l.offers && l.offers.length ? l.offers[0].amount : null) ?? l.price)
                      : (l.buyNowPrice ?? l.price)
                    ) as number,
                    buyNowPrice: l.buyNowPrice,
                    type: l.type,
                    category: l.category,
                    location: l.location,
                    images: (l as unknown as { images?: unknown[] | null }).images ?? null,
                    endsAt: (l as unknown as { endsAt?: Date | string | null }).endsAt ?? null,
                    status: (l as unknown as { status?: string | null }).status ?? "ACTIVE",
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


