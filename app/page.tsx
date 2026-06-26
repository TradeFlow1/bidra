import type { Metadata } from "next";
import BetaNotice from "@/components/beta-notice";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import {
  AppButtonLink,
  AppCard,
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
  title: "Bidra marketplace | Buy now and offers in Australia",
  description: "Browse Bidra for Australian marketplace listings, Buy now items, offers, pickup, postage, and local handover details.",
  alternates: { canonical: "/" },
};

const categoryIcons: Record<string, string> = {
  Electronics: "phone",
  Furniture: "home",
  Fashion: "shirt",
  Vehicles: "car",
  Home: "home",
  "Home & Living": "home",
  Sports: "ball",
  Appliances: "grid",
  "Sports & Outdoors": "ball",
};

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [listings, categoryRows] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", orders: { none: {} } },
      orderBy: { createdAt: "desc" },
      take: 12,
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
        photos: true,
        offers: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, expiresAt: true } },
        _count: { select: { offers: true } },
        seller: { select: { username: true, name: true, createdAt: true, location: true, emailVerified: true, phoneVerified: true, phone: true } },
      },
    }),
    prisma.listing.groupBy({
      by: ["category"],
      where: { status: "ACTIVE", orders: { none: {} } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 8,
    }),
  ]);

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
  const heroFeaturedListings = heroListings.map((listing) => {
    const imageList = [
      ...(Array.isArray(listing.images) ? (listing.images as Array<string | { url?: string; src?: string }>) : []),
      ...(Array.isArray(listing.photos) ? (listing.photos as Array<string | { url?: string; src?: string }>) : []),
    ];
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
      location: listing.location,
      type: listing.type,
      offerCount: listing._count?.offers ?? 0,
      endsAt: listing.offers?.[0]?.expiresAt ?? null,
      sellerName: listing.seller?.name || listing.seller?.username || null,
      imageUrl,
    };
  });

  function renderCard(listing: (typeof listings)[number]) {
    const currentOffer = listing.offers?.[0]?.amount ?? null;
    const displayPrice = listing.type === "OFFERABLE" ? ((currentOffer ?? listing.price) as number) : ((listing.buyNowPrice ?? listing.price) as number);
    const combinedImages = [
      ...(Array.isArray(listing.images) ? listing.images : []),
      ...(Array.isArray(listing.photos) ? listing.photos : []),
    ];

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
          images: combinedImages.length ? combinedImages : null,
          status: listing.status,
          offerCount: listing._count?.offers ?? 0,
          currentOffer,
          endsAt: listing.offers?.[0]?.expiresAt ?? null,
          createdAt: listing.createdAt,
          seller: {
            name: listing.seller?.name || listing.seller?.username || null,
            memberSince: listing.seller?.createdAt ?? null,
            location: listing.seller?.location ?? null,
            emailVerified: listing.seller?.emailVerified ?? false,
            phoneVerified: listing.seller?.phoneVerified ?? false,
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
    <ReferencePage className="bidra-homepage overflow-hidden">
      <div className={`${appShell} pt-4 sm:pt-6`}>
        <BetaNotice />

        <HomeHero sellHref={userId ? "/sell/new" : "/auth/register"} featuredListings={heroFeaturedListings} />

        <MarketplaceSection
          eyebrow="Latest listings"
          title="Fresh from Australian sellers"
          description="Real active listings, shown as they are available."
          action={<AppButtonLink href="/listings?sort=newest" variant="secondary">View all listings</AppButtonLink>}
        >
          <div className="rounded-[32px] border border-[#EDE9FE] bg-white/74 p-3 shadow-[0_22px_70px_rgba(43,16,85,0.08)] sm:p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.length ? listings.slice(0, 10).map(renderCard) : <EmptyMarketplaceState title="No active listings yet" body="Bidra is ready for quality Australian inventory." href={userId ? "/sell/new" : "/auth/register"} cta="List an item" />}
            </div>
          </div>
        </MarketplaceSection>

        <MarketplaceSection
          eyebrow="Categories"
          title="Browse the marketplace"
          description="Jump into the sections buyers check first."
          action={<AppButtonLink href="/listings" variant="secondary">View all categories</AppButtonLink>}
        >
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <section className="py-5 sm:py-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <AppCard className="overflow-hidden bg-[#120724] p-6 text-white shadow-[0_22px_70px_rgba(18,7,36,0.18)] sm:p-7">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C4B5FD]">Buyers</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em]">Compare clearly.</h2>
              <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-white/68">Price, suburb, seller context and messages stay close to the item.</p>
              <AppButtonLink href="/listings" className="mt-6 inline-flex">Browse listings</AppButtonLink>
            </AppCard>
            <AppCard className="p-6 sm:p-7">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Sellers</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-[#120724]">List with trust.</h2>
              <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-[#62516F]">Create a clean listing with photos, price, handover details and buyer-ready messaging.</p>
              <AppButtonLink href={userId ? "/sell/new" : "/auth/register"} variant="secondary" className="mt-6 inline-flex">Sell an item</AppButtonLink>
            </AppCard>
          </div>
        </section>

        <HomeTrustStrip />
      </div>
    </ReferencePage>
  );
}
