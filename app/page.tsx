import type { Metadata } from "next";
import Link from "next/link";
import BetaNotice from "@/components/beta-notice";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import {
  CategoryPillGrid,
  EmptyMarketplaceState,
  HomeHero,
  HomeTrustStrip,
  MarketplaceSection,
  ReferencePage,
  appShell,
} from "@/components/marketplace-redesign";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Bidra marketplace | Buy Now and offers in Australia",
  description: "Browse Bidra for Australian marketplace listings, Buy Now items, offers, pickup, postage, and local handover details.",
  alternates: { canonical: "/" },
};

const categoryIcons: Record<string, string> = {
  Electronics: "phone",
  Furniture: "home",
  Fashion: "shirt",
  Vehicles: "car",
  Home: "home",
  Sports: "ball",
  Appliances: "grid",
  "Sports & Outdoors": "ball",
};

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", orders: { none: {} } },
    orderBy: { createdAt: "desc" },
    take: 10,
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
      offers: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
      _count: { select: { offers: true } },
      seller: { select: { username: true, name: true, createdAt: true, location: true, emailVerified: true, phone: true } },
    },
  });

  const categoryRows = await prisma.listing.groupBy({
    by: ["category"],
    where: { status: "ACTIVE", orders: { none: {} } },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 8,
  });

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watchRows = await prisma.watchlist.findMany({
      where: { userId, listingId: { in: listings.map((listing) => String(listing.id)) } },
      select: { listingId: true },
    });
    watchRows.forEach((row) => watchedSet.add(String(row.listingId)));
  }

  const normaliseCategory = (value: string) => {
    const raw = String(value || "Marketplace").split(" > ")[0].trim();

    if (/sport|outdoor/i.test(raw)) return "Sports & Outdoors";
    if (/furniture|home|living/i.test(raw)) return "Home & Living";
    if (/vehicle|car|bike|motor/i.test(raw)) return "Vehicles";
    if (/fashion|clothing|shoe|watch/i.test(raw)) return "Fashion";
    if (/appliance|kitchen/i.test(raw)) return "Appliances";
    if (/electronic|phone|laptop|computer|headphone|camera/i.test(raw)) return "Electronics";

    return raw || "Marketplace";
  };

  const categoryMap = new Map<string, number>();
  categoryRows.forEach((row) => {
    const label = normaliseCategory(String(row.category || "Marketplace"));
    categoryMap.set(label, (categoryMap.get(label) || 0) + row._count.category);
  });

  const preferredCategoryOrder = [
    "Electronics",
    "Home & Living",
    "Vehicles",
    "Sports & Outdoors",
    "Fashion",
    "Appliances",
  ];

  const categories = preferredCategoryOrder.map((label) => {
    const count = categoryMap.get(label) || 0;

    return {
      label,
      href: `/listings?category=${encodeURIComponent(label)}`,
      icon: categoryIcons[label] || "grid",
      meta: count > 0 ? `${count} ${count === 1 ? "item" : "items"}` : "Explore",
    };
  });

  function getRotatingHeroListings(source: typeof listings) {
    if (source.length <= 4) return source;

    const bucket = Math.floor(Date.now() / 60000);
    const start = bucket % source.length;
    const rotated = source.slice(start).concat(source.slice(0, start));

    return rotated.slice(0, 4);
  }

  const heroListings = getRotatingHeroListings(listings);

  function renderCard(listing: (typeof listings)[number]) {
    const currentOffer = listing.offers?.[0]?.amount ?? null;
    const displayPrice = listing.type === "OFFERABLE" ? ((currentOffer ?? listing.price) as number) : ((listing.buyNowPrice ?? listing.price) as number);

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
          images: listing.images ?? null,
          status: listing.status,
          offerCount: listing._count?.offers ?? 0,
          currentOffer,
          createdAt: listing.createdAt,
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
  }

  return (
    <ReferencePage>
      <div className={appShell + " pt-4 sm:pt-6"}>
        <BetaNotice />

        <HomeHero sellHref={userId ? "/sell/new" : "/auth/register"} featuredListings={heroListings.map((listing) => {
          const imageList = Array.isArray(listing.images) ? (listing.images as Array<string | { url?: string; src?: string }>) : [];
          const firstImage = imageList[0];
          const imageUrl =
            typeof firstImage === "string"
              ? firstImage
              : firstImage?.url || firstImage?.src || null;

          return {
            id: listing.id,
            title: listing.title,
            category: String(listing.category || "Listing").split(" > ")[0],
            price: Number(listing.type === "OFFERABLE" ? (listing.offers?.[0]?.amount ?? listing.price) : (listing.buyNowPrice ?? listing.price)),
            imageUrl,
          };
        })} />

        <HomeTrustStrip />

        <MarketplaceSection title="Browse categories" action={<Link href="/listings" className="text-sm font-black text-[#0E7490]">View all categories</Link>}>
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection title="Latest listings" action={<Link href="/listings?sort=newest" className="text-sm font-black text-[#0E7490]">View all listings</Link>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.length ? listings.map(renderCard) : <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />}
          </div>
        </MarketplaceSection>

        <section className="mb-24 rounded-[28px] border border-[#C7D2FE] bg-[#F8FAFC] p-5 shadow-sm sm:p-7 md:mb-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Safer local trading</div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#0F172A] sm:text-3xl">Agree the details clearly before handover.</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">
                Bidra helps buyers and sellers keep a clear message record while arranging pickup, postage or delivery directly.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Keep conversations in Bidra Messages.",
                "Inspect items before paying where practical.",
                "Use public handover locations when possible.",
                "Report unsafe listings or unusual requests.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#C7D2FE] bg-white p-4 text-sm font-bold leading-6 text-[#334155] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ReferencePage>
  );
}
