import type { Metadata } from "next";
import Link from "next/link";
import BetaNotice from "@/components/beta-notice";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import ClosingSoonFeed from "@/components/closing-soon-feed";
import PromotedListingsRail from "@/components/promoted-listings-rail";
import { getPromotedListingIds, promotedListingSort } from "@/lib/featured-listings";
import {
  AppButtonLink,
  AppCard,
  AppPanel,
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
  "Home & Living": "home",
  Sports: "ball",
  Appliances: "grid",
  "Sports & Outdoors": "ball",
};

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const promotedListingIds = getPromotedListingIds();

  const [listings, promotedListings, categoryRows] = await Promise.all([
    prisma.listing.findMany({
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
        offers: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, expiresAt: true } },
        _count: { select: { offers: true } },
        seller: { select: { username: true, name: true, createdAt: true, location: true, emailVerified: true, phoneVerified: true, phone: true } },
      },
    }),
    promotedListingIds.length
      ? prisma.listing.findMany({
          where: { id: { in: promotedListingIds }, status: "ACTIVE", orders: { none: {} } },
          take: 12,
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            type: true,
            price: true,
            buyNowPrice: true,
            createdAt: true,
            images: true,
            offers: { orderBy: { amount: "desc" }, take: 1, select: { amount: true, expiresAt: true } },
            _count: { select: { offers: true } },
            seller: { select: { username: true, name: true } },
          },
        })
      : Promise.resolve([]),
    prisma.listing.groupBy({
      by: ["category"],
      where: { status: "ACTIVE", orders: { none: {} } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 8,
    }),
  ]);

  promotedListings.sort(promotedListingSort(promotedListingIds));

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

  const activeCategoryCount = Array.from(categoryMap.values()).filter((count) => count > 0).length;
  const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0] || null;

  function getRotatingHeroListings(source: typeof listings) {
    if (source.length <= 4) return source;

    const bucket = Math.floor(Date.now() / 60000);
    const start = bucket % source.length;
    const rotated = source.slice(start).concat(source.slice(0, start));

    return rotated.slice(0, 4);
  }

  const heroListings = getRotatingHeroListings(listings);
  const heroFeaturedListings = heroListings.map((listing) => {
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
      location: listing.location,
      type: listing.type,
      offerCount: listing._count?.offers ?? 0,
      endsAt: listing.offers?.[0]?.expiresAt ?? null,
      sellerName: listing.seller?.name || listing.seller?.username || null,
      imageUrl,
    };
  });

  const homepageStats = [
    {
      label: "Fresh listings",
      value: listings.length ? `${listings.length} shown` : "Ready",
      body: "Newest active items stay close to the search experience.",
    },
    {
      label: "Top category",
      value: topCategory ? topCategory[0] : "All categories",
      body: topCategory ? `${topCategory[1]} active ${topCategory[1] === 1 ? "item" : "items"} in the current category sample.` : "Browse across Australia.",
    },
    {
      label: "Buying modes",
      value: "Buy now + offers",
      body: "Keep fixed-price and offer-led listings in one clean flow.",
    },
    {
      label: "Seller clarity",
      value: activeCategoryCount ? `${activeCategoryCount} live groups` : "Profile led",
      body: "Listing, seller and message context stay visible before handover.",
    },
  ];

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

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {homepageStats.map((stat) => (
            <AppCard key={stat.label} className="bg-white/88">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7C3AED]">{stat.label}</div>
              <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#120724]">{stat.value}</div>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#62516F]">{stat.body}</p>
            </AppCard>
          ))}
        </section>

        <HomeTrustStrip />

        <MarketplaceSection
          eyebrow="Featured listings"
          title="Worth checking now"
          description="Live items with clear price, offer and seller context."
          action={<AppButtonLink href="/listings" variant="secondary">Browse all</AppButtonLink>}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="min-w-0">
              {promotedListings.length ? (
                <PromotedListingsRail listings={promotedListings} />
              ) : (
                <AppPanel>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Promoted listings</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#120724]">Featured listings will appear here</h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#62516F]">
                    Featured inventory uses the same listing routes and buyer actions as the rest of the marketplace.
                  </p>
                </AppPanel>
              )}
            </div>

            <AppPanel tone="dark" className="flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C4B5FD]">Marketplace confidence</div>
                <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.05em] text-white">Clear listings. Real sellers. Direct actions.</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/72">
                  Browse active items with price, location, offer activity and seller signals close at hand.
                </p>
              </div>
              <div className="mt-6 grid gap-3 text-sm font-bold text-white/82">
                {["Buy now and make an offer", "Watchlist and messages", "Seller and safety signals"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </AppPanel>
          </div>
        </MarketplaceSection>

        <ClosingSoonFeed />

        <MarketplaceSection
          eyebrow="Browse faster"
          title="Shop by category"
          description="Popular Australian marketplace categories, ready to refine."
          action={<AppButtonLink href="/listings" variant="secondary">View all categories</AppButtonLink>}
        >
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection
          eyebrow="Recently listed"
          title="Fresh listings from Australian sellers"
          description="Real active listings, refreshed from the marketplace."
          action={<AppButtonLink href="/listings?sort=newest" variant="secondary">View all listings</AppButtonLink>}
        >
          <div className="rounded-[32px] border border-[#EDE9FE] bg-white/74 p-3 shadow-[0_22px_70px_rgba(43,16,85,0.08)] sm:p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.length ? listings.map(renderCard) : <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />}
            </div>
          </div>
        </MarketplaceSection>

        <section className="mb-24 overflow-hidden rounded-[34px] border border-[#DDD6FE] bg-white p-5 shadow-[0_22px_70px_rgba(43,16,85,0.09)] sm:p-7 md:mb-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Trust built in</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#120724] sm:text-4xl">Built for trusted local trade.</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#62516F]">
                Searchable listings, seller context, saved items, messages and order records in one marketplace.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <AppButtonLink href="/how-it-works">How it works</AppButtonLink>
                <AppButtonLink href="/prohibited-items" variant="secondary">Marketplace rules</AppButtonLink>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Clear buyer actions", "Buy now, Make an offer and Message seller stay direct."],
                ["Seller context", "Profiles, locations and listing metadata stay visible."],
                ["Message records", "Conversations remain attached to marketplace activity."],
                ["Safety routes", "Report, support and prohibited item guidance remain close."],
              ].map((item) => (
                <AppCard key={item[0]} className="shadow-none">
                  <div className="text-sm font-black text-[#120724]">{item[0]}</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#62516F]">{item[1]}</p>
                </AppCard>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ReferencePage>
  );
}
