export const revalidate = 10;
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ListingType } from "@prisma/client";
import { CATEGORY_GROUPS, joinCategory } from "@/lib/categories";
import ListingCard from "@/components/listing-card";
import MobileFiltersToggle from "@/components/mobile-filters-toggle";

type KeywordParams = {
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

function normalizeCategoryValue(value: string) {
  if (!value) return value;
  if (value.indexOf(" > ") >= 0) return value;
  if (value.indexOf(" Ã") >= 0) return value.split(" ")[0] || value;
  return value;
}

function buildClearHref(current: KeywordParams | undefined, keyToRemove: keyof KeywordParams) {
  const params: string[] = [];
  const keys: (keyof KeywordParams)[] = ["q", "category", "type", "condition", "location", "min", "max", "sort"];

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key === keyToRemove) continue;
    const value = cleanStr(current && current[key]);
    if (!value) continue;
    params.push(encodeURIComponent(String(key)) + "=" + encodeURIComponent(value));
  }

  return params.length ? "/listings?" + params.join("&") : "/listings";
}

function conditionLabel(value: string) {
  if (value === "NEW") return "New";
  if (value === "USED_LIKE_NEW") return "Used - Like New";
  if (value === "USED_GOOD") return "Used - Good";
  if (value === "USED_FAIR") return "Used - Fair";
  return value;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: KeywordParams;
}) {
  const q = cleanStr(searchParams?.q);
  const category = normalizeCategoryValue(cleanStr(searchParams?.category));
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
          { category: { startsWith: category + " > " } },
        ],
      });
    } else {
      const childValue = category.indexOf(" > ") >= 0 ? String(category.split(" > ").pop() || "") : category;
      and.push({
        OR: [
          { category: category },
          { category: childValue },
        ],
      });
    }
  }

  if (type === "BUY_NOW" || type === "OFFERABLE") {
    and.push({ type: type as ListingType });
  }

  if (condition) and.push({ condition: condition });
  if (location) and.push({ location: { contains: location, mode: "insensitive" } });

  if (!moneyErr) {
    if (typeof minCents === "number") and.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") and.push({ price: { lte: maxCents } });
  }

  const finalWhere = and.length ? where : undefined;

  const orderBy: Prisma.ListingOrderByWithRelationInput =
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
  if (userId && listings.length) {
    const watchRows = await prisma.watchlist.findMany({
      where: {
        userId: userId,
        listingId: { in: listings.map(function (l) { return String(l.id); }) },
      },
      select: { listingId: true },
    });
    for (let i = 0; i < watchRows.length; i += 1) {
      watchedSet.add(String(watchRows[i].listingId));
    }
  }

  const activeFilters: { label: string; href: string }[] = [];
  if (q) activeFilters.push({ label: q, href: buildClearHref(searchParams, "q") });
  if (category) activeFilters.push({ label: category, href: buildClearHref(searchParams, "category") });
  if (type) activeFilters.push({ label: type === "BUY_NOW" ? "Buy Now" : "Offers", href: buildClearHref(searchParams, "type") });
  if (condition) activeFilters.push({ label: conditionLabel(condition), href: buildClearHref(searchParams, "condition") });
  if (location) activeFilters.push({ label: location, href: buildClearHref(searchParams, "location") });
  if (cleanStr(searchParams?.min)) activeFilters.push({ label: "$" + cleanStr(searchParams?.min) + "+", href: buildClearHref(searchParams, "min") });
  if (cleanStr(searchParams?.max)) activeFilters.push({ label: "Up to $" + cleanStr(searchParams?.max), href: buildClearHref(searchParams, "max") });
  if (sort) {
    const sortLabel = sort === "price_asc" ? "Low to high" : sort === "price_desc" ? "High to low" : "Newest";
    activeFilters.push({ label: sortLabel, href: buildClearHref(searchParams, "sort") });
  }

  const FiltersForm = () => (
    <form action="/listings" method="get" className="space-y-4">
      <div className="space-y-3">
        <input
          name="q"
          type="search"
          enterKeyHint="search"
          defaultValue={q}
          placeholder="Keyword"
          className="bd-input"
        />
        <button type="submit" className="sr-only" aria-hidden="true" tabIndex={-1}>Search</button>

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

        <select name="type" defaultValue={type} className="bd-input">
          <option value="">All types</option>
          <option value="BUY_NOW">Buy Now</option>
          <option value="OFFERABLE">Offers</option>
        </select>

        <select name="sort" defaultValue={sort} className="bd-input">
          <option value="">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>

        <select name="condition" defaultValue={condition} className="bd-input">
          <option value="">Any condition</option>
          <option value="NEW">New</option>
          <option value="USED_LIKE_NEW">Used - Like New</option>
          <option value="USED_GOOD">Used - Good</option>
          <option value="USED_FAIR">Used - Fair</option>
        </select>

        <input name="location" defaultValue={location} placeholder="Location" className="bd-input" />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="min"
            defaultValue={(searchParams?.min ?? "").trim()}
            placeholder="Min price"
            className="bd-input"
            inputMode="decimal"
          />
          <input
            name="max"
            defaultValue={(searchParams?.max ?? "").trim()}
            placeholder="Max price"
            className="bd-input"
            inputMode="decimal"
          />
        </div>

        <button type="submit" className="bd-btn bd-btn-primary w-full">Show results</button>
      </div>

      {moneyErr ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Use numbers for price filters.
        </div>
      ) : null}
    </form>
  );

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6 lg:py-6">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">Listings</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">All</Link>
              <Link href="/listings?type=BUY_NOW" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">Buy Now</Link>
              <Link href="/listings?type=OFFERABLE" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">Offers</Link>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm">
              <div className="p-4 sm:p-5">
                <MobileFiltersToggle>
                  <FiltersForm />
                </MobileFiltersToggle>
                <div className="hidden xl:block">
                  <div className="mb-4 border-b border-[#E2E8F0] pb-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Refine results</div>
                    <div className="mt-2 text-sm text-[#475569]">Filter by keyword, category, type, condition, location, and price.</div>
                  </div>
                  <FiltersForm />
                </div>
              </div>
              {activeFilters.length > 0 ? (
                <div className="border-t border-[#E2E8F0] px-5 py-4">
                  <Link href="/listings" className="text-sm font-semibold text-[#1D4ED8] underline underline-offset-2">
                    Reset filters
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Browse results</div>
                  <div className="mt-1 text-sm font-semibold text-[#0F172A]">{listings.length} results</div>
                </div>
              </div>

              {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map(function (item) {
                    return (
                      <Link
                        key={item.label + ":" + item.href}
                        href={item.href}
                        className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] shadow-sm"
                      >
                        <span>{item.label}</span>
                        <span className="ml-2 text-[#94A3B8]">×</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="browseList w-full grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              {listings.length === 0 ? (
                <div className="col-span-full rounded-[28px] border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto max-w-md">
                    <div className="text-lg font-bold text-[#0F172A]">No listings found</div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Link href="/listings" className="bd-btn bd-btn-primary">View all</Link>
                      <Link href="/sell/new" className="bd-btn bd-btn-ghost">Sell</Link>
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
                        condition: l.condition,
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
          </div>
        </section>
      </div>
    </main>
  );
}