export const revalidate = 10;

import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Prisma, ListingType } from "@prisma/client";
import ListingCard from "@/components/listing-card";
import MobileFiltersToggle from "@/components/mobile-filters-toggle";
import { authOptions } from "@/lib/auth";
import { CATEGORY_GROUPS, joinCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Browse active listings",
  description: "Search active Bidra marketplace listings by keyword, category, suburb, city, postcode, sale type, and condition. Compare Buy Now and offer listings with seller trust signals.",
  alternates: {
    canonical: "/listings",
  },
  openGraph: {
    title: "Browse active listings | Bidra",
    description: "Find active Australian marketplace listings by category and location, with Buy Now, offers, and trusted seller filters.",
    url: "/listings",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Browse active listings | Bidra",
    description: "Search active Bidra marketplace listings by category, location, sale type, and condition.",
  },
};

type ListingsSearchParams = {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  condition?: string;
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
  if (value.indexOf(" Ãƒ") >= 0) return value.split(" ")[0] || value;
  return value;
}

function buildHref(params: { q?: string; category?: string; location?: string; type?: string; condition?: string; min?: string; max?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.location) sp.set("location", params.location);
  if (params.type) sp.set("type", params.type);
  if (params.condition) sp.set("condition", params.condition);
  if (params.min) sp.set("min", params.min);
  if (params.max) sp.set("max", params.max);
  if (params.sort) sp.set("sort", params.sort);
  const qs = sp.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

function sortLabel(sort: string) {
  if (sort === "price_asc") return "Price low to high";
  if (sort === "price_desc") return "Price high to low";
  if (sort === "activity") return "Most activity";
  return "Newest";
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
  searchParams?: ListingsSearchParams;
}) {
  const q = cleanStr(searchParams?.q).replace(/\s+/g, " ");
  const category = normalizeCategoryValue(cleanStr(searchParams?.category));
  const location = cleanStr(searchParams?.location);
  const type = cleanStr(searchParams?.type);
  const condition = cleanStr(searchParams?.condition);
  const min = cleanStr(searchParams?.min);
  const max = cleanStr(searchParams?.max);
  const sort = cleanStr(searchParams?.sort);

  const minCents = parseMoneyToCents(min);
  const maxCents = parseMoneyToCents(max);
  const moneyErr = Number.isNaN(Number(minCents)) || Number.isNaN(Number(maxCents));

  const hasFilters = !!q || !!category || !!location || !!type || !!condition || !!min || !!max || !!sort;

  const and: Prisma.ListingWhereInput[] = [
    {
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
    { status: "ACTIVE" },
    { orders: { none: {} } },
  ];

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
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

  if (location) {
    and.push({ location: { contains: location, mode: "insensitive" } });
  }

  if (type === "BUY_NOW" || type === "OFFERABLE") {
    and.push({ type: type as ListingType });
  }

  if (condition) {
    and.push({ condition });
  }

  if (!moneyErr) {
    if (typeof minCents === "number") and.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") and.push({ price: { lte: maxCents } });
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "price_asc"
      ? [{ price: "asc" }, { createdAt: "desc" }, { id: "desc" }]
      : sort === "price_desc"
      ? [{ price: "desc" }, { createdAt: "desc" }, { id: "desc" }]
      : sort === "activity"
      ? [{ offers: { _count: "desc" } }, { createdAt: "desc" }, { id: "desc" }]
      : [{ createdAt: "desc" }, { id: "desc" }];

  const listings = await prisma.listing.findMany({
    where: { AND: and },
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
      seller: {
        select: {
          username: true,
          name: true,
          createdAt: true,
          location: true,
          emailVerified: true,
          phone: true,
        },
      },
      _count: {
        select: { offers: true },
      },
    },
  });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watchRows = await prisma.watchlist.findMany({
      where: {
        userId,
        listingId: { in: listings.map((listing) => { return String(listing.id); }) },
      },
      select: { listingId: true },
    });
    for (let i = 0; i < watchRows.length; i += 1) {
      watchedSet.add(String(watchRows[i].listingId));
    }
  }

  const activeFilters: Array<{ label: string; href: string }> = [];
  if (q) activeFilters.push({ label: `Keyword: ${q}`, href: buildHref({ category, location, type, condition, min, max, sort }) });
  if (category) activeFilters.push({ label: `Category: ${category}`, href: buildHref({ q, location, type, condition, min, max, sort }) });
  if (location) activeFilters.push({ label: `Location: ${location}`, href: buildHref({ q, category, type, condition, min, max, sort }) });
  if (type) {
    activeFilters.push({
      label: type === "BUY_NOW" ? "Sale type: Buy Now" : "Sale type: Offers",
      href: buildHref({ q, category, location, condition, min, max, sort }),
    });
  }
  if (condition) activeFilters.push({ label: `Condition: ${conditionLabel(condition)}`, href: buildHref({ q, category, location, type, min, max, sort }) });
  if (min) activeFilters.push({ label: `Min: $${min}`, href: buildHref({ q, category, location, type, condition, max, sort }) });
  if (max) activeFilters.push({ label: `Max: $${max}`, href: buildHref({ q, category, location, type, condition, min, sort }) });
  if (sort) activeFilters.push({ label: `Sort: ${sortLabel(sort)}`, href: buildHref({ q, category, location, type, condition, min, max }) });

  const filterSummary = [
    q ? `keyword “${q}”` : "",
    category ? `category ${category}` : "",
    location ? `location ${location}` : "",
    type === "BUY_NOW" ? "Buy Now" : type === "OFFERABLE" ? "Offers" : "",
    condition ? `condition ${conditionLabel(condition)}` : "",
    min ? `min $${min}` : "",
    max ? `max $${max}` : "",
    sort ? `sorted by ${sortLabel(sort)}` : "",
  ].filter(Boolean).join(" • ");

  const categoryShortcuts = CATEGORY_GROUPS.slice(0, 6).map(function (group) {
    return group.parent;
  });

  const FiltersForm = () => (
    <form action="/listings" method="get" className="space-y-3">
      <input
        name="q"
        type="search"
        enterKeyHint="search"
        defaultValue={q}
        placeholder="Search title, category, suburb, or postcode"
        className="bd-input"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
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

        <input name="location" defaultValue={location} placeholder="Suburb, city, state, or postcode" className="bd-input" />

        <select name="type" defaultValue={type} className="bd-input">
          <option value="">Sale type: All</option>
          <option value="BUY_NOW">Sale type: Buy Now</option>
          <option value="OFFERABLE">Sale type: Offers</option>
        </select>

        <select name="condition" defaultValue={condition} className="bd-input">
          <option value="">Any condition</option>
          <option value="NEW">New</option>
          <option value="USED_LIKE_NEW">Used - Like New</option>
          <option value="USED_GOOD">Used - Good</option>
          <option value="USED_FAIR">Used - Fair</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="min"
            defaultValue={min}
            placeholder="Min price"
            className="bd-input"
            inputMode="decimal"
          />
          <input
            name="max"
            defaultValue={max}
            placeholder="Max price"
            className="bd-input"
            inputMode="decimal"
          />
        </div>

        <select name="sort" defaultValue={sort} className="bd-input">
          <option value="">Sort: Newest</option>
          <option value="price_asc">Sort: Price low to high</option>
          <option value="price_desc">Sort: Price high to low</option>
          <option value="activity">Sort: Most activity</option>
        </select>
      </div>

      {moneyErr ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Use whole numbers for price filters, for example 50 or 250.
        </div>
      ) : null}

      <button type="submit" className="bd-btn bd-btn-primary w-full">Apply filters</button>
    </form>
  );

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6 lg:py-6">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">Browse active marketplace listings</h1>
          <p className="mt-2 text-sm text-[#475569]">Search active Australian marketplace listings by keyword, category, suburb, city, postcode, sale type, condition, and trusted seller signals. Create a free account to watch items, buy, offer, sell, and message safely.</p>
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm">
              <div className="p-4 sm:p-5">
                <MobileFiltersToggle>
                  <FiltersForm />
                </MobileFiltersToggle>
                <div className="hidden xl:block">
                  <div className="mb-4 border-b border-[#E2E8F0] pb-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Search and filter</div>
                    <div className="mt-2 text-sm text-[#475569]">Keyword, category, location, sale type, condition, and sort create shareable discovery URLs buyers can revisit and sellers can promote.</div>
                  </div>
                  <FiltersForm />
                </div>
              </div>
              {hasFilters ? (
                <div className="border-t border-[#E2E8F0] px-5 py-4">
                  <Link href="/listings" className="text-sm font-semibold text-[#1D4ED8] underline underline-offset-2">
                    Clear filters
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-3">
            <div className="rounded-[28px] border border-[#D8E1F0] bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Popular marketplace shortcuts</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryShortcuts.map(function (label) {
                  return (
                    <Link
                      key={label}
                      href={buildHref({ q, location, type, condition, min, max, sort, category: label })}
                      className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A]"
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D8E1F0] bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Results</div>
                  <div className="mt-1 text-sm font-semibold text-[#0F172A]">{listings.length} results</div>
                  {hasFilters ? <p className="mt-1 text-xs text-[#64748B]">{filterSummary}. Sign up to watch items, message sellers, buy now, or place offers.</p> : null}
                </div>
                {hasFilters ? (
                  <Link href="/listings" className="text-xs font-semibold text-[#1D4ED8] underline underline-offset-2">
                    Clear filters
                  </Link>
                ) : null}
              </div>

              {activeFilters.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeFilters.map(function (item) {
                    return (
                      <Link
                        key={item.label + ":" + item.href}
                        href={item.href}
                        className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] shadow-sm"
                      >
                        <span>{item.label}</span>
                        <span className="ml-2 text-[#94A3B8]" aria-hidden="true">×</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="browseList w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {listings.length === 0 ? (
                <div className="col-span-full rounded-[28px] border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto max-w-md">
                    <div className="text-lg font-bold text-[#0F172A]">{hasFilters ? "No trusted matches for those filters yet." : "No active listings yet"}</div>
                    <p className="mt-2 text-sm text-[#475569]">
                      {hasFilters ? "Try fewer filters, check spelling, or browse all active Australian marketplace listings. Bidra only shows active listings that are available to buy or make offers on, and sellers can create new buyer-ready listings anytime." : "New local listings will appear here as sellers publish active items for Buy Now or offers."}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Link href="/listings" className="bd-btn bd-btn-primary">Browse all listings</Link>
                    </div>
                  </div>
                </div>
              ) : (
                listings.map((listing) => {
                  const currentOffer = listing.offers && listing.offers.length ? listing.offers[0].amount : null;
                  const displayPrice = listing.type === "OFFERABLE"
                    ? ((currentOffer ?? listing.price) as number)
                    : ((listing.buyNowPrice ?? listing.price) as number);

                  return (
                    <ListingCard
                      key={listing.id}
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        description: listing.description,
                        price: displayPrice,
                        buyNowPrice: listing.buyNowPrice,
                        type: listing.type,
                        category: listing.category,
                        condition: listing.condition,
                        location: listing.location,
                        images: (listing as unknown as { images?: unknown[] | null }).images ?? null,
                        status: (listing as unknown as { status?: string | null }).status ?? "ACTIVE",
                        endsAt: (listing as unknown as { endsAt?: string | Date | null }).endsAt ?? null,
                        offerCount: (listing as unknown as { _count?: { offers?: number } })._count?.offers ?? 0,
                        currentOffer,
                        seller: {
                          name: listing.seller?.name || listing.seller?.username || null,
                          memberSince: listing.seller?.createdAt ?? null,
                          location: listing.seller?.location ?? null,
                          emailVerified: listing.seller?.emailVerified ?? false,
                          phone: listing.seller?.phone ?? null,
                        },
                      }}
                      initiallyWatched={watchedSet.has(listing.id)}
                      viewerAuthed={!!userId}
                      showWatchButton={true}
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
