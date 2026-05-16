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

  const categories = categoryRows.slice(0, 6).map((row) => {
    const raw = String(row.category || "Marketplace").split(" > ")[0];
    return {
      label: raw,
      href: `/listings?category=${encodeURIComponent(raw)}`,
      icon: categoryIcons[raw] || "grid",
      meta: `${row._count.category} ${row._count.category === 1 ? "item" : "items"}`,
    };
  });

  for (const fallback of fallbackCategories) {
    if (categories.length >= 6) {
      break;
    }

    if (categories.some((category) => category.label === fallback)) {
      continue;
    }

    categories.push({
      label: fallback,
      href: `/listings?category=${encodeURIComponent(fallback)}`,
      icon: categoryIcons[fallback] || "grid",
      meta: "Explore",
    });
  }

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
        <HomeHero sellHref={userId ? "/sell/new" : "/auth/register"} featuredListings={listings.slice(0, 4).map((listing) => ({
          id: listing.id,
          title: listing.title,
          category: String(listing.category || "Listing").split(" > ")[0],
          price: Number(listing.type === "OFFERABLE" ? (listing.offers?.[0]?.amount ?? listing.price) : (listing.buyNowPrice ?? listing.price)),
        }))} />

        <MarketplaceSection title="Browse categories" action={<Link href="/listings" className="text-sm font-black text-[#0B4DFF]">View all categories</Link>}>
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection title="Latest listings" className="pb-24 md:pb-8" action={<Link href="/listings?sort=newest" className="text-sm font-black text-[#0B4DFF]">View all listings</Link>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.length ? listings.slice(0, 5).map(renderCard) : <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />}
          </div>
        </MarketplaceSection>
</div>
    </ReferencePage>
  );
}








