import Image from "next/image";
import { getServerSession } from "next-auth";
import Link from "next/link";
import DistanceSlider from "@/components/distance-slider";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { distanceKm, findAuLocation, parseListingLocation } from "@/lib/au-location";

const pageSize = 50;
const maxPriceCents = 100000000;

const categories = [
  "All categories",
  "Electronics",
  "Home & Living",
  "Vehicles",
  "Sports & Outdoors",
  "Fashion",
  "Kids & Baby",
  "Business & Industrial",
  "Books & Media",
  "Other",
];

type ListingsPageProps = {
  searchParams?: {
    category?: string;
    min?: string;
    max?: string;
    location?: string;
    state?: string;
    radius?: string;
    condition?: string;
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

export default async function ListingsPage({ searchParams = {} }: ListingsPageProps) {
  const session = await getServerSession(authOptions);
  const profile = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { location: true, state: true, suburb: true, postcode: true },
      })
    : null;

  const profileLocationParts = [profile?.postcode, profile?.suburb].filter(Boolean);
  const profileLocation = profileLocationParts.length ? profileLocationParts.join(" ") : (profile?.location || "");
  const profileState = profile?.state || "";

  const selectedCategory = normalizeCategory(searchParams.category);
  const minPrice = parseDollars(searchParams.min);
  const maxPrice = parseDollars(searchParams.max);
  const selectedCondition = searchParams.condition || "";
  const selectedSort = searchParams.sort || "newest";
  const selectedLocation = searchParams.location || profileLocation || "";
  const selectedState = searchParams.state || profileState || "";
  const selectedRadius = (searchParams.radius || "").replace(/[^0-9.]/g, "");
  const selectedRadiusKm = Number(selectedRadius);
  const searchLocation = findAuLocation(selectedLocation, selectedState);
  const radiusIsActive = Number.isFinite(selectedRadiusKm) && selectedRadiusKm > 0;
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

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    where.price = {
      gte: typeof minPrice === "number" ? minPrice : undefined,
      lte: typeof maxPrice === "number" ? maxPrice : maxPriceCents,
    };
  }

  if (!canApplyRadius && (selectedLocation.trim() || selectedState.trim())) {
    const fallbackLocationPredicates: Array<{ location: { contains: string; mode: "insensitive" } }> = [];

    if (selectedLocation.trim()) {
      fallbackLocationPredicates.push({ location: { contains: selectedLocation.trim(), mode: "insensitive" } });
    }

    if (selectedState.trim()) {
      fallbackLocationPredicates.push({ location: { contains: selectedState.trim(), mode: "insensitive" } });
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
        category: true,
        createdAt: true,
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
    : radiusIsActive
      ? []
      : listings;

  const visibleListings = radiusFilteredListings.slice(0, pageSize);
  const displayCount = radiusFilteredListings.length;
  const showPagination = canApplyRadius ? displayCount > pageSize : listingCount > pageSize;

  return (
    <>
      <main className="hidden bg-white text-[#4F46E5] md:block hover:bg-[#F5F3FF]">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[300px_minmax(0,1fr)] border-x border-[#E2E8F0]">
          <aside className="border-r border-[#E2E8F0] px-10 py-12">
            <h1 className="text-2xl font-black tracking-tight">Categories</h1>
            <nav className="mt-6 space-y-2">
              {categories.map((category) => {
                const active = category === selectedCategory;
                return (
                  <Link
                    key={category}
                    href={categoryHref(category)}
                    className={
                      active
                        ? "block rounded-xl bg-[#EEF2FF] px-4 py-3 text-base font-black text-[#4F46E5]"
                        : "block rounded-xl px-4 py-3 text-base font-semibold text-[#475569] hover:bg-[#F5F3FF] hover:text-[#4F46E5]"
                    }
                  >
                    {category}
                  </Link>
                );
              })}
            </nav>

            <form action="/listings" className="mt-12 border-t border-[#E2E8F0] pt-8">
              <input type="hidden" name="category" value={selectedCategory === "All categories" ? "" : slugify(selectedCategory)} />
              <h2 className="text-2xl font-black tracking-tight">Filters</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-3 text-sm font-black">Price</div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <input name="min" defaultValue={searchParams.min || ""} className="h-12 min-w-0 rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold" placeholder="Min $" inputMode="numeric" />
                    <span className="text-[#94A3B8]">-</span>
                    <input name="max" defaultValue={searchParams.max || ""} className="h-12 min-w-0 rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold" placeholder="Max $" inputMode="numeric" />
                  </div>
                  <button type="submit" className="mt-3 h-11 w-full rounded-xl bg-[#EEF2FF] text-sm font-black text-[#4F46E5] hover:bg-[#E0E7FF]">Apply</button>
                </div>

                <div>
                  <span className="text-sm font-black">Location</span>
                  <div className="mt-3 space-y-3">
                    <select
                      name="state"
                      defaultValue={selectedState}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F5F3FF]"
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
                  <select name="condition" defaultValue={selectedCondition} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F5F3FF]">
                    <option value="">Any condition</option>
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like new</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="USED">Used</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black">Sort by</span>
                  <select name="sort" defaultValue={selectedSort} className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F5F3FF]">
                    <option value="newest">Newest first</option>
                    <option value="price-low">Price low to high</option>
                    <option value="price-high">Price high to low</option>
                  </select>
                </label>

                                <div className="space-y-3 border-t border-[#E2E8F0] pt-5">
                  <button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white shadow-[0_12px_26px_rgba(79,70,229,0.18)] hover:bg-[#4338CA] !text-white disabled:!text-white"
                  >
                    Apply filters
                  </button>
                  <Link href="/listings" className="block text-center text-sm font-black text-[#4F46E5] hover:text-[#4338CA]">
                    Clear filters
                  </Link>
                </div>
              </div>
            </form>
          </aside>

          <section className="px-10 py-12">
            <div className="mb-7 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tight">All listings</h2>
                <p className="mt-2 text-base font-semibold text-[#64748B]">{displayCount} results</p>
                {radiusIsActive ? (
                  <p className="mt-1 text-sm font-semibold text-[#4F46E5]">
                    {canApplyRadius
                      ? `Showing listings within ${selectedRadiusKm} km of ${searchLocation?.suburb}, ${searchLocation?.state}`
                      : "Add a suburb/postcode in your profile or enter one here to use distance filtering."}
                  </p>
                ) : null}


              </div>
              <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-5 text-sm font-black text-[#4F46E5] shadow-sm hover:bg-[#F5F3FF]">
                Save search
              </button>
            </div>

            {visibleListings.length ? (
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
                {visibleListings.map((listing) => {
                  const image = getListingImage(listing.images, listing.photos);
                  const price = listing.buyNowPrice ?? listing.price;

                  return (
                    <Link
                      key={listing.id}
                      href={"/listings/" + listing.id}
                      className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(79,70,229,0.14)] hover:bg-[#F5F3FF]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
                        {image ? (
                          <Image
                            src={image}
                            alt={listing.title}
                            fill
                            sizes="(min-width: 1280px) 220px, (min-width: 768px) 33vw, 100vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-5xl text-[#4F46E5]">▯</div>
                        )}
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4F46E5] shadow-sm hover:bg-[#F5F3FF]">♡</span>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-black">{listing.title}</h3>
                        <p className="mt-3 text-lg font-black">{formatPrice(price)}</p>
                        <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-[#64748B]">
                          <span className="truncate">{listing.location}</span>
                          <span>{formatAge(listing.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#C7D2FE] bg-[#F8FAFC] px-8 py-14 text-center">
                <h3 className="text-xl font-black text-[#0F172A]">No active listings found</h3>
                <p className="mt-2 text-sm font-semibold text-[#64748B]">Clear filters or create a real listing.</p>
                <Link href="/sell/new" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black text-white !text-white disabled:!text-white">
                  Sell an item
                </Link>
              </div>
            )}

            {showPagination ? (
              <div className="mt-12 text-center text-sm font-semibold text-[#64748B]">
                More than {pageSize} listings found. Page controls can be enabled when we add server-side page query support.
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <main className="min-h-screen bg-white text-[#4F46E5] md:hidden hover:bg-[#F5F3FF]">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-black">Categories</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">Mobile layout paused while desktop is fixed.</p>
        </div>
      </main>
    </>
  );
}

