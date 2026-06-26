import Image from "next/image";
import { getServerSession } from "next-auth";
import Link from "next/link";
import DistanceSlider from "@/components/distance-slider";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { distanceKm, findAuLocation, parseListingLocation } from "@/lib/au-location";
import { ProductPlaceholder, placeholderKindFromCategory } from "@/components/marketplace-ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const pageSize = 50;
const maxPriceCents = 100000000;

const categories = [
  "All categories",
  "Electronics",
  "Home & Living",
  "Vehicles",
  "Machinery & Equipment",
  "Sports & Outdoors",
  "Fashion",
  "Kids & Baby",
  "Books & Media",
  "Other",
];

type ListingsPageProps = {
  searchParams?: {
    category?: string;
    min?: string;
    max?: string;
    location?: string;
    q?: string;
    type?: string;
    state?: string;
    radius?: string;
    condition?: string;
    fulfillment?: string;
    sort?: string;
  };
};

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeCategory(value?: string) {
  if (!value) return "All categories";
  const found = categories.find((category) => slugify(category) === value || category === value);
  return found || "All categories";
}

function parseDollars(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed * 100);
}

function cleanSearchQuery(value?: string) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function formatAge(date: Date) {
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) return Math.max(1, Math.floor(diff / minute)) + "m ago";
  if (diff < day) return Math.floor(diff / hour) + "h ago";
  return Math.floor(diff / day) + "d ago";
}

function getListingImage(images: string[] | null | undefined, photos: string[] | null | undefined) {
  const all = [...(images || []), ...(photos || [])];
  const first = all.find((item) => typeof item === "string" && item.trim().length > 0);
  return first || null;
}

function categoryHref(category: string) {
  if (category === "All categories") return "/listings";
  return "/listings?category=" + slugify(category);
}

function saleTypeLabel(type: string | null | undefined, buyNowPrice: number | null | undefined) {
  if (type === "OFFERABLE") return buyNowPrice ? "Offers + buy now" : "Offers";
  return "Buy now";
}

function handoverLabel(value: string | null | undefined) {
  const raw = String(value || "").toUpperCase();
  if (raw === "POSTAGE") return "Postage";
  if (raw === "DELIVERY") return "Delivery";
  return "Pickup";
}

function suburbLabel(value: string | null | undefined) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Australia";
  const first = raw.split(",")[0]?.trim() || raw;
  return first.replace(/^\d{4}\s+/, "").trim() || raw;
}

function timeRemaining(value: Date | string | null | undefined) {
  if (!value) return "";
  const end = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(end.getTime())) return "";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "Closing soon";
}

function sellerTrustLabel(seller: { emailVerified?: boolean | null; phoneVerified?: boolean | null; createdAt?: Date | null } | null | undefined) {
  if (seller?.emailVerified && seller?.phoneVerified) return "Verified seller";
  if (seller?.emailVerified || seller?.phoneVerified) return "Verified profile";
  if (seller?.createdAt) return "Seller profile";
  return "Bidra seller";
}

export default async function ListingsPage({ searchParams = {} }: ListingsPageProps) {
  await getServerSession(authOptions);

  const selectedCategory = normalizeCategory(searchParams.category);
  const minPrice = parseDollars(searchParams.min);
  const maxPrice = parseDollars(searchParams.max);
  const selectedCondition = searchParams.condition || "";
  const selectedSort = searchParams.sort || "newest";
  const selectedQuery = cleanSearchQuery(searchParams.q);
  const selectedType = String(searchParams.type || "").toUpperCase();
  const selectedFulfillment = String(searchParams.fulfillment || "").toUpperCase();
  const explicitLocation = searchParams.location || "";
  const explicitState = searchParams.state || "";
  const selectedLocation = explicitLocation || "";
  const selectedState = explicitState || "";
  const selectedRadius = (searchParams.radius || "").replace(/[^0-9.]/g, "");
  const selectedRadiusKm = Number(selectedRadius);
  const locationFilterRequested = Boolean(explicitLocation.trim() || explicitState.trim() || selectedRadius.trim());
  const filterLocation = explicitLocation || "";
  const filterState = explicitState || "";
  const searchLocation = locationFilterRequested ? findAuLocation(filterLocation, filterState) : null;
  const radiusIsActive = locationFilterRequested && Number.isFinite(selectedRadiusKm) && selectedRadiusKm > 0;
  const canApplyRadius = radiusIsActive && Boolean(searchLocation);

  const where: any = {
    status: "ACTIVE",
    orders: { none: {} },
    price: { lte: maxPriceCents },
    AND: [
      { OR: [{ buyNowPrice: null }, { buyNowPrice: { lte: maxPriceCents } }] },
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
  };

  if (selectedCategory !== "All categories") {
    where.category = { equals: selectedCategory, mode: "insensitive" };
  }

  if (selectedType === "BUY_NOW") {
    where.AND.push({ OR: [{ type: "BUY_NOW" }, { buyNowPrice: { not: null } }] });
  } else if (selectedType === "OFFERABLE") {
    where.type = "OFFERABLE";
  }

  if (["PICKUP", "POSTAGE", "DELIVERY"].includes(selectedFulfillment)) {
    where.fulfillmentType = selectedFulfillment;
  }

  if (selectedQuery) {
    where.AND.push({
      OR: [
        { title: { contains: selectedQuery, mode: "insensitive" } },
        { description: { contains: selectedQuery, mode: "insensitive" } },
        { category: { contains: selectedQuery, mode: "insensitive" } },
        { condition: { contains: selectedQuery, mode: "insensitive" } },
        { location: { contains: selectedQuery, mode: "insensitive" } },
      ],
    });
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    where.price = {
      gte: typeof minPrice === "number" ? minPrice : undefined,
      lte: typeof maxPrice === "number" ? maxPrice : maxPriceCents,
    };
  }

  if (locationFilterRequested && !canApplyRadius && (filterLocation.trim() || filterState.trim())) {
    const fallbackLocationPredicates: Array<{ location: { contains: string; mode: "insensitive" } }> = [];

    if (filterLocation.trim()) {
      fallbackLocationPredicates.push({ location: { contains: filterLocation.trim(), mode: "insensitive" } });
    }

    if (filterState.trim()) {
      fallbackLocationPredicates.push({ location: { contains: filterState.trim(), mode: "insensitive" } });
    }

    if (fallbackLocationPredicates.length) {
      where.AND.push({ OR: fallbackLocationPredicates });
    }
  }

  if (selectedCondition) {
    where.condition = { equals: selectedCondition, mode: "insensitive" };
  }

  const orderBy = selectedSort === "price-low"
    ? { price: "asc" as const }
    : selectedSort === "price-high"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const [listings, listingCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      take: canApplyRadius ? 500 : pageSize + 1,
      select: {
        id: true,
        title: true,
        location: true,
        images: true,
        photos: true,
        price: true,
        buyNowPrice: true,
        type: true,
        condition: true,
        fulfillmentType: true,
        category: true,
        createdAt: true,
        offers: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, expiresAt: true } },
        _count: { select: { offers: true } },
        seller: { select: { username: true, name: true, createdAt: true, emailVerified: true, phoneVerified: true } },
      },
    }),
    canApplyRadius ? Promise.resolve(0) : prisma.listing.count({ where }),
  ]);

  const radiusFilteredListings = canApplyRadius
    ? listings.filter((listing) => {
        const listingGeo = parseListingLocation(listing.location);
        if (!listingGeo) return false;

        const straightLineKm = distanceKm(searchLocation!, listingGeo);
        const safeRadiusKm = Math.max(0, selectedRadiusKm - 5);

        return straightLineKm <= safeRadiusKm;
      })
    : listings;

  const visibleListings = radiusFilteredListings.slice(0, pageSize);
  const displayCount = radiusFilteredListings.length;
  const showPagination = canApplyRadius ? displayCount > pageSize : listingCount > pageSize;

  return (
    <>
      <main className="hidden bg-[#FBF9FF] px-6 py-7 text-[#120724] md:block">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[300px_minmax(0,1fr)] overflow-hidden rounded-[34px] border border-[#EDE9FE] bg-white shadow-[0_24px_80px_rgba(43,16,85,0.10)]">
          <aside className="border-r border-[#EDE9FE] bg-[#FBF9FF] px-10 py-12">
            <h1 className="text-2xl font-black tracking-tight text-[#120724]">Categories</h1>
            <nav className="mt-6 space-y-2">
              {categories.map((category) => {
                const active = category === selectedCategory;
                return (
                  <Link
                    key={category}
                    href={categoryHref(category)}
                    className={
                      active
                        ? "block rounded-2xl bg-[#F5F3FF] px-4 py-3 text-base font-black text-[#5B21B6] shadow-sm ring-1 ring-[#DDD6FE]"
                        : "block rounded-2xl px-4 py-3 text-base font-semibold text-[#62516F] hover:bg-white hover:text-[#5B21B6]"
                    }
                  >
                    {category}
                  </Link>
                );
              })}
            </nav>

            <form action="/listings" className="mt-12 border-t border-[#EDE9FE] pt-8">
              <input type="hidden" name="category" value={selectedCategory === "All categories" ? "" : slugify(selectedCategory)} />
              <h2 className="text-2xl font-black tracking-tight text-[#120724]">Filters</h2>
              <div className="mt-6 space-y-6">
                <label className="block">
                  <span className="text-sm font-black">Search</span>
                  <input
                    name="q"
                    defaultValue={selectedQuery}
                    className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold"
                    placeholder="Keyword, item, brand or suburb"
                    autoComplete="off"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black">Sale type</span>
                  <select name="type" defaultValue={selectedType} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569]">
                    <option value="">Buy now and offers</option>
                    <option value="BUY_NOW">Buy now available</option>
                    <option value="OFFERABLE">Offers only</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black">Handover</span>
                  <select name="fulfillment" defaultValue={selectedFulfillment} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569]">
                    <option value="">Any handover</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="POSTAGE">Postage</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </label>

                <div>
                  <div className="mb-3 text-sm font-black">Price</div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <input name="min" defaultValue={searchParams.min || ""} className="h-12 min-w-0 rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold" placeholder="Min $" inputMode="numeric" />
                    <span className="text-[#94A3B8]">-</span>
                    <input name="max" defaultValue={searchParams.max || ""} className="h-12 min-w-0 rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold" placeholder="Max $" inputMode="numeric" />
                  </div>
                  <button type="submit" className="mt-3 h-11 w-full rounded-2xl border border-[#DDD6FE] bg-white text-sm font-black text-[#5B21B6] shadow-sm hover:bg-[#F5F3FF]">Apply</button>
                </div>

                <div>
                  <span className="text-sm font-black">Location</span>
                  <div className="mt-3 space-y-3">
                    <select
                      name="state"
                      defaultValue={selectedState}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569]"
                    >
                      <option value="">All Australia</option>
                      <option value="QLD">Queensland</option>
                      <option value="NSW">New South Wales</option>
                      <option value="VIC">Victoria</option>
                      <option value="SA">South Australia</option>
                      <option value="WA">Western Australia</option>
                      <option value="TAS">Tasmania</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">Northern Territory</option>
                    </select>

                    <input
                      name="location"
                      defaultValue={selectedLocation}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold"
                      placeholder="Suburb or postcode"
                      autoComplete="postal-code"
                    />

                    <DistanceSlider defaultValue={selectedRadius} />
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-black">Condition</span>
                  <select name="condition" defaultValue={selectedCondition} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569]">
                    <option value="">Any condition</option>
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like new</option>
                    <option value="USED">Used</option>
                    <option value="FOR_PARTS">For parts</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black">Sort by</span>
                  <select name="sort" defaultValue={selectedSort} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569]">
                    <option value="newest">Newest first</option>
                    <option value="price-low">Price low to high</option>
                    <option value="price-high">Price high to low</option>
                  </select>
                </label>

                <div className="space-y-3 border-t border-[#E2E8F0] pt-5">
                  <button
                    type="submit"
                    className="bd-btn bd-btn-primary h-12 w-full rounded-2xl text-sm"
                  >
                    Apply filters
                  </button>
                  <Link href="/listings" className="block text-center text-sm font-black text-[#6D28D9] hover:text-[#5B21B6]">
                    Clear filters
                  </Link>
                </div>
              </div>
            </form>
          </aside>

          <section className="bg-white px-9 py-12">
            <div className="mb-7 flex items-start justify-between gap-6">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Premium browse</div>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#120724]">All listings</h2>
                <p className="mt-2 text-base font-semibold text-[#62516F]">{displayCount} active listings across Australia</p>
                {selectedQuery ? (
                  <p className="mt-1 text-sm font-semibold text-[#6D28D9]">
                    Search: {selectedQuery}
                  </p>
                ) : null}
                {radiusIsActive ? (
                  <p className="mt-1 text-sm font-semibold text-[#6D28D9]">
                    {canApplyRadius
                      ? `Showing listings within ${selectedRadiusKm} km of ${searchLocation?.suburb}, ${searchLocation?.state}`
                      : "Add a suburb/postcode in your profile or enter one here to use distance filtering."}
                  </p>
                ) : null}
              </div>
              <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-5 text-sm font-black text-[#5B21B6] shadow-sm">
                Share filters from URL
              </div>
            </div>

            {visibleListings.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {visibleListings.map((listing) => {
                  const image = getListingImage(listing.images, listing.photos);
                  const price = listing.buyNowPrice ?? listing.price;
                  const typeLabel = saleTypeLabel(listing.type, listing.buyNowPrice);
                  const handover = handoverLabel(listing.fulfillmentType);
                  const offerCount = listing._count?.offers ?? 0;
                  const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
                  const sellerName = listing.seller?.name || listing.seller?.username || "Bidra seller";
                  const trustLabel = sellerTrustLabel(listing.seller);
                  const place = suburbLabel(listing.location);

                  return (
                    <Link
                      key={listing.id}
                      href={"/listings/" + listing.id}
                      className="group overflow-hidden rounded-[24px] border border-[#EDE9FE] bg-white shadow-[0_14px_40px_rgba(43,16,85,0.06)] transition hover:-translate-y-0.5 hover:border-[#C4B5FD] hover:shadow-[0_22px_60px_rgba(43,16,85,0.11)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
                        {image ? (
                          <Image
                            src={image}
                            alt={listing.title}
                            fill
                            sizes="(min-width: 1280px) 220px, (min-width: 768px) 33vw, 100vw"
                            className="object-cover transition duration-300"
                            unoptimized
                          />
                        ) : (
                          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Photo coming soon" />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.10em] text-[#5B21B6] shadow-sm ring-1 ring-[#DDD6FE]">{typeLabel}</span>
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#2437FF] shadow-sm hover:bg-[#F8FAFC]" aria-hidden="true">
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
</span>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-black text-[#120724]">{listing.title}</h3>
                        <p className="mt-3 text-lg font-black text-[#120724]">{formatPrice(price)}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[#5B21B6]">
                          <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{handover}</span>
                          {listing.condition ? <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{String(listing.condition).replace(/_/g, " ")}</span> : null}
                          {listing.type === "OFFERABLE" ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">{offerCount} offers</span> : null}
                          {remaining ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">{remaining}</span> : null}
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-[#62516F]">
                          <span className="truncate">{place}</span>
                          <span>{formatAge(listing.createdAt)}</span>
                        </div>
                        <div className="mt-3 border-t border-[#F0EAFE] pt-3 text-xs font-bold leading-5 text-[#62516F]">
                          <div className="truncate text-[#3B254F]">{sellerName}</div>
                          <div className="truncate">{trustLabel}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#C4B5FD] bg-[#FBF9FF] px-8 py-14 text-center">
                <h3 className="text-xl font-black text-[#120724]">No listings match these filters</h3>
                <p className="mt-2 text-sm font-semibold text-[#62516F]">Clear filters to search all Australia, or try a broader keyword/category.</p>
                <Link href="/sell/new" className="bd-btn bd-btn-primary mt-6 inline-flex h-12 rounded-2xl px-6 text-sm">
                  Sell an item
                </Link>
              </div>
            )}

            {showPagination ? (
              <div className="mt-12 text-center text-sm font-semibold text-[#62516F]">
                More than {pageSize} listings found. Page controls can be enabled when we add server-side page query support.
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#FFFFFF_46%)] pb-32 text-[#120724] md:hidden">
        <section className="px-4 pb-5 pt-4">
          <div className="overflow-hidden rounded-[30px] border border-[#DDD6FE] bg-gradient-to-br from-white via-[#FBF9FF] to-[#F5F3FF] p-5 shadow-[0_18px_45px_rgba(43,16,85,0.09)]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7C3AED]">Marketplace</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.92] tracking-[-0.065em] text-[#120724]">Browse listings</h1>
            <p className="mt-3 max-w-[290px] text-sm font-semibold leading-6 text-[#62516F]">{displayCount} local results. Filter fast, compare clearly, then tap a listing to inspect it.</p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <Link
                  key={category}
                  href={categoryHref(category)}
                  className={
                    active
                      ? "shrink-0 rounded-full bg-[#6D28D9] px-4 py-2.5 text-sm font-black text-white !text-white shadow-[0_10px_24px_rgba(109,40,217,0.22)]"
                      : "shrink-0 rounded-full border border-[#DDD6FE] bg-white px-4 py-2.5 text-sm font-black text-[#5B21B6] shadow-sm"
                  }
                >
                  {category}
                </Link>
              );
            })}
          </div>

          <form action="/listings" className="mt-4 rounded-[28px] border border-[#EDE9FE] bg-white p-4 shadow-[0_16px_38px_rgba(43,16,85,0.08)]">
            <input type="hidden" name="category" value={selectedCategory === "All categories" ? "" : slugify(selectedCategory)} />
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-[-0.035em] text-[#120724]">Refine</h2>
                <p className="mt-1 text-xs font-semibold text-[#62516F]">Built for quick one-handed browsing.</p>
              </div>
              <Link href="/listings" className="rounded-full border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-black text-[#5B21B6] shadow-sm">Clear</Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <input name="q" defaultValue={selectedQuery} className="col-span-2 h-12 min-w-0 rounded-2xl border border-[#D8E1F0] px-4 text-sm font-bold text-[#08112F]" placeholder="Search listings" autoComplete="off" />
              <input name="min" defaultValue={searchParams.min || ""} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] px-4 text-sm font-bold text-[#08112F]" placeholder="Min $" inputMode="numeric" />
              <input name="max" defaultValue={searchParams.max || ""} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] px-4 text-sm font-bold text-[#08112F]" placeholder="Max $" inputMode="numeric" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <select name="type" defaultValue={selectedType} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] bg-white px-3 text-sm font-bold text-[#08112F]">
                <option value="">Any type</option>
                <option value="BUY_NOW">Buy now</option>
                <option value="OFFERABLE">Offers</option>
              </select>
              <select name="fulfillment" defaultValue={selectedFulfillment} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] bg-white px-3 text-sm font-bold text-[#08112F]">
                <option value="">Any handover</option>
                <option value="PICKUP">Pickup</option>
                <option value="POSTAGE">Postage</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <select name="state" defaultValue={selectedState} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] bg-white px-3 text-sm font-bold text-[#08112F]">
                <option value="">Australia</option>
                <option value="QLD">QLD</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="SA">SA</option>
                <option value="WA">WA</option>
                <option value="TAS">TAS</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
              </select>
              <select name="sort" defaultValue={selectedSort} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] bg-white px-3 text-sm font-bold text-[#08112F]">
                <option value="newest">Newest</option>
                <option value="price-low">Lowest price</option>
                <option value="price-high">Highest price</option>
              </select>
            </div>

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <input name="location" defaultValue={selectedLocation} className="h-12 min-w-0 rounded-2xl border border-[#D8E1F0] px-4 text-sm font-bold text-[#08112F]" placeholder="Suburb or postcode" autoComplete="postal-code" />
              <button type="submit" className="bd-btn bd-btn-primary h-12 rounded-2xl px-4 text-sm">Apply</button>
            </div>
          </form>
        </section>

        <section className="px-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.055em] text-[#120724]">Latest finds</h2>
              <p className="mt-1 text-xs font-bold text-[#62516F]">{selectedCategory}</p>
            </div>
            <p className="rounded-full border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-black text-[#5B21B6] shadow-sm">{displayCount} results</p>
          </div>

          {visibleListings.length ? (
            <div className="space-y-3">
              {visibleListings.map((listing) => {
                const image = getListingImage(listing.images, listing.photos);
                const price = listing.buyNowPrice ?? listing.price;
                const typeLabel = saleTypeLabel(listing.type, listing.buyNowPrice);
                const handover = handoverLabel(listing.fulfillmentType);
                const offerCount = listing._count?.offers ?? 0;
                const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
                const sellerName = listing.seller?.name || listing.seller?.username || "Bidra seller";
                const trustLabel = sellerTrustLabel(listing.seller);
                const place = suburbLabel(listing.location);

                return (
                  <Link key={listing.id} href={"/listings/" + listing.id} className="block overflow-hidden rounded-[28px] border border-[#EDE9FE] bg-white shadow-[0_16px_38px_rgba(43,16,85,0.08)] active:scale-[0.995]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F8FAFC]">
                      {image ? (
                        <Image src={image} alt={listing.title} fill sizes="100vw" className="object-cover" />
                      ) : (
                        <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Photo coming soon" />
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.10em] text-[#5B21B6] shadow-sm ring-1 ring-[#DDD6FE]">{typeLabel}</span>
                      {remaining ? <span className="absolute bottom-3 left-3 rounded-full bg-[#120724]/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.10em] text-white shadow-sm">{remaining}</span> : null}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.02em] text-[#120724]">{listing.title}</h3>
                          <p className="mt-2 text-2xl font-black tracking-[-0.045em] text-[#120724]">{formatPrice(price)}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-black text-[#5B21B6] shadow-sm">{formatAge(listing.createdAt)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[#3730A3]">
                        <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{handover}</span>
                        {listing.condition ? <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{String(listing.condition).replace(/_/g, " ")}</span> : null}
                        {listing.type === "OFFERABLE" ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">{offerCount} offers</span> : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-[#62516F]">
                        <span className="min-w-0 truncate">{place}</span>
                        <span className="shrink-0">{trustLabel}</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-[#8B7A98]">{sellerName}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[30px] border border-dashed border-[#C4B5FD] bg-white px-5 py-10 text-center shadow-[0_16px_38px_rgba(43,16,85,0.08)]">
              <h3 className="text-xl font-black text-[#120724]">No listings found</h3>
              <p className="mt-2 text-sm font-semibold text-[#62516F]">Clear filters or check another category.</p>
              <Link href="/listings" className="bd-btn bd-btn-primary mt-5 inline-flex h-12 rounded-2xl px-5 text-sm">Clear filters</Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
