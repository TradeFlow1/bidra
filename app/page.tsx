import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import {
  CategoryPillGrid,
  EmptyMarketplaceState,
  HomeHero,
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

const fallbackCategories = ["Electronics", "Furniture", "Vehicles", "Sports", "Fashion", "Appliances"];

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
        <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-3 sm:hidden"><div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B4DFF]">Mobile marketplace</div><div className="mt-1 text-sm font-semibold text-[#475569]">Tap cards for details, offers, or Buy Now.</div></div>
        <div className="hidden sm:block rounded-[24px] border border-[#D8E1F0] bg-white p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B4DFF]">Desktop marketplace</div><div className="mt-1 text-sm font-semibold text-[#475569]">Compare listings side-by-side and open listing detail in one click.</div></div>

        <HomeHero sellHref={userId ? "/sell/new" : "/auth/register"} featuredListings={listings.slice(0, 4).map((listing) => ({
          id: listing.id,
          title: listing.title,
          category: String(listing.category || "Listing").split(" > ")[0],
          price: Number(listing.type === "OFFERABLE" ? (listing.offers?.[0]?.amount ?? listing.price) : (listing.buyNowPrice ?? listing.price)),
        }))} />

        <MarketplaceSection title="Browse categories" action={<Link href="/listings" className="text-sm font-black text-[#0E7490]">View all categories</Link>}>
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection title="Latest listings" className="pb-24 md:pb-8" action={<Link href="/listings?sort=newest" className="text-sm font-black text-[#0E7490]">View all listings</Link>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.length ? listings.slice(0, 4).map(renderCard) : <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />}
          </div>
        </MarketplaceSection>
</div>
    </ReferencePage>
  );
}


