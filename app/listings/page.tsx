export const revalidate = 10;
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ListingType } from "@prisma/client";
import { CATEGORY_GROUPS, joinCategory } from "@/lib/categories";
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

function buildClearHref(current: SearchParams | undefined, keyToRemove: keyof SearchParams) {
  const params: string[] = [];
  const keys: (keyof SearchParams)[] = ["q", "category", "type", "condition", "location", "min", "max", "sort"];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key === keyToRemove) continue;
    const value = cleanStr(current && current[key]);
    if (!value) continue;
    params.push(encodeURIComponent(String(key)) + "=" + encodeURIComponent(value));
  }
  return params.length ? "/listings?" + params.join("&") : "/listings";
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

  const hasAnyFilters =
    !!q || !!category || !!type || !!condition || !!location || !!searchParams?.min || !!searchParams?.max || !!sort;

  const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  const minCents = parseMoneyToCents(searchParams?.min);
  const maxCents = parseMoneyToCents(searchParams?.max);
  const moneyErr = Number.isNaN(Number(minCents)) || Number.isNaN(Number(maxCents));

  const and: Prisma.ListingWhereInput[] = [];
  const where: Prisma.ListingWhereInput = { AND: and };

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

  and.push({ status: "ACTIVE" });
  and.push({ orders: { none: {} } });

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (category) {
    const isParent = CATEGORY_GROUPS.some(function (g) { return g.parent === category; });
    if (isParent) {
      and.push({
        OR: [
          { category: category },
          { category: { startsWith: category + " › " } },
        ],
      });
    } else {
      const legacyChild = category.indexOf(" › ") >= 0 ? category.split(" › ").pop() : category;
      and.push({
        OR: [
          { category: category },
          { category: String(legacyChild || "") },
        ],
      });
    }
  }

  if (type === "BUY_NOW" || type === "OFFERABLE") {
    and.push({ type: type as ListingType });
  }

  if (condition) and.push({ condition: condition });

  if (location) {
    and.push({ location: { contains: location, mode: "insensitive" } });
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
      : { createdAt: "desc" };

  let listings: any[] = [];

  if (!hasAnyFilters) {
    try {
      const res = await fetch(baseUrl + "/api/listings", { cache: "force-cache" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data && data.listings) ? data.listings : [];
        listings = arr;
      }
    } catch {
    }
  }

  if (hasAnyFilters || !listings.length) {
    listings = await prisma.listing.findMany({
      where: finalWhere,
      orderBy: orderBy,
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        type: true,
        condition: true,
        status: true,
        price: true,
        buyNowPrice: true,
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

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const watchedSet = new Set<string>();

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
  const clearText = resultsCount === 0 && hasAnyFilter ? "Clear filters" : "Clear all";
  const resultsLabel = hasAnyFilter ? `${listings.length} matching listings` : `${listings.length} latest listings`;

  const activeFilters: { label: string; href: string }[] = [];
  if (q) activeFilters.push({ label: `Search: ${q}`, href: buildClearHref(searchParams, "q") });
  if (category) activeFilters.push({ label: `Category: ${category}`, href: buildClearHref(searchParams, "category") });
  if (type) activeFilters.push({ label: `Sale type: ${type === "BUY_NOW" ? "Buy Now" : "Offerable"}`, href: buildClearHref(searchParams, "type") });
  if (condition) activeFilters.push({ label: `Condition: ${condition}`, href: buildClearHref(searchParams, "condition") });
  if (location) activeFilters.push({ label: `Location: ${location}`, href: buildClearHref(searchParams, "location") });
  if (cleanStr(searchParams?.min)) activeFilters.push({ label: `Min: $${cleanStr(searchParams?.min)}`, href: buildClearHref(searchParams, "min") });
  if (cleanStr(searchParams?.max)) activeFilters.push({ label: `Max: $${cleanStr(searchParams?.max)}`, href: buildClearHref(searchParams, "max") });
  if (sort) {
    const sortLabel = sort === "price_asc" ? "Price: low to high" : sort === "price_desc" ? "Price: high to low" : sort;
    activeFilters.push({ label: `Sort: ${sortLabel}`, href: buildClearHref(searchParams, "sort") });
  }

  const FiltersForm = () => (
    <form action="/listings" method="get" className="space-y-4">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="bd-label text-xs">Search</div>
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={q}
            placeholder="Search listings, brands, or keywords"
            className="bd-input"
          />
          <button type="submit" className="sr-only" aria-hidden="true" tabIndex={-1}>Search</button>
        </div>

        <div className="md:col-span-4">
          <div className="bd-label text-xs">Category</div>
          <select name="category" defaultValue={category} className="bd-input">
            <option value="">All categories</option>
            {CATEGORY_GROUPS.map(function (g) {
              return (
                <optgroup key={g.parent} label={g.parent}>
                  <option value={g.parent}>{g.parent}</option>
                  {g.children.map(function (c) {
                    return (
                      <option key={g.parent + ":" + c} value={joinCategory(g.parent, c)}>
                        {c}
                      </option>
                    );
                  })}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="bd-label text-xs">Sale type</div>
          <select name="type" defaultValue={type} className="bd-input">
            <option value="">Any</option>
            <option value="BUY_NOW">Buy Now</option>
            <option value="OFFERABLE">Offerable</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="bd-label text-xs">Sort</div>
          <select name="sort" defaultValue={sort} className="bd-input">
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="bd-label text-xs">Condition</div>
          <select name="condition" defaultValue={condition} className="bd-input">
            <option value="">Any</option>
            <option value="New">New</option>
            <option value="Used - Like New">Used - Like New</option>
            <option value="Used - Good">Used - Good</option>
            <option value="Used - Fair">Used - Fair</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <div className="bd-label text-xs">Location</div>
          <input name="location" defaultValue={location} placeholder="Suburb, State" className="bd-input" />
        </div>

        <div className="md:col-span-2">
          <div className="bd-label text-xs">Min price (AUD)</div>
          <input name="min" defaultValue={(searchParams?.min ?? "").trim()} placeholder="Min price" className="bd-input" inputMode="decimal" />
        </div>

        <div className="md:col-span-2">
          <div className="bd-label text-xs">Max price (AUD)</div>
          <input name="max" defaultValue={(searchParams?.max ?? "").trim()} placeholder="Max price" className="bd-input" inputMode="decimal" />
        </div>
      </div>

      {moneyErr ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Price filters must be numbers, for example 10 or 10.50.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="bd-btn bd-btn-primary">{showResultsText}</button>
        {hasAnyFilter ? <Link href="/listings" className="bd-btn bd-btn-secondary">{clearText}</Link> : null}
      </div>
    </form>
  );

  return (
    <main>
      <div className="bd-container">
        <section className="section py-5 space-y-4">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-5 shadow-sm">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Marketplace</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Browse listings</h1>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                Discover local items from verified Bidra sellers. Filter by category, condition, location, price, and sale type.
              </p>
              <div className="mt-3 inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-semibold text-neutral-700 shadow-sm">
                {resultsLabel}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">Refine your search</div>
                <div className="mt-1 text-xs text-neutral-600">
                  Narrow results by keyword, category, location, price, and listing type.
                </div>
              </div>
              {hasAnyFilter ? (
                <Link href="/listings" className="text-sm font-semibold text-neutral-700 underline underline-offset-2">
                  Clear all filters
                </Link>
              ) : null}
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-3 sm:p-4">
              <MobileFiltersToggle>
                <FiltersForm />
              </MobileFiltersToggle>

              <div className="hidden md:block">
                <FiltersForm />
              </div>
            </div>

            {activeFilters.length > 0 ? (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active filters</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeFilters.map(function (item) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm"
                      >
                        <span>{item.label}</span>
                        <span className="ml-2 text-neutral-400">×</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Results</div>
              <div className="mt-1 text-xs text-neutral-600">
                {hasAnyFilter ? "Updated from your current filters." : "Showing the latest marketplace listings."}
              </div>
            </div>
            {hasAnyFilter ? (
              <div className="text-xs font-medium text-neutral-500">
                {resultsCount} found
              </div>
            ) : null}
          </div>

          <div className="browseList w-full grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-10 text-center">
                <div className="mx-auto max-w-md">
                  <div className="text-lg font-bold text-neutral-900">No listings match your filters</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    Try widening your price range, changing the category, or clearing filters to see more listings.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href="/listings" className="bd-btn bd-btn-primary">View all listings</Link>
                    <Link href="/sell/new" className="bd-btn bd-btn-ghost">List an item</Link>
                  </div>
                </div>
              </div>
            ) : (
              listings.map(function (l) {
                const currentOffer = l.offers && l.offers.length ? l.offers[0].amount : null;
                const displayPrice = l.type === "OFFERABLE"
                  ? ((currentOffer ?? l.price) as number)
                  : ((l.buyNowPrice ?? l.price) as number);

                return (
                  <ListingCard
                    key={l.id}
                    listing={{
                      id: l.id,
                      title: l.title,
                      description: l.description,
                      price: displayPrice,
                      buyNowPrice: l.buyNowPrice,
                      type: l.type,
                      category: l.category,
                      location: l.location,
                      images: (l as unknown as { images?: unknown[] | null }).images ?? null,
                      status: (l as unknown as { status?: string | null }).status ?? "ACTIVE",
                    }}
                    initiallyWatched={watchedSet.has(l.id)}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
