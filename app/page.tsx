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

  function renderMobileCompactCard(listing: (typeof listings)[number]) {
    const currentOffer = listing.offers?.[0]?.amount ?? null;
    const displayPrice = listing.type === "OFFERABLE" ? ((currentOffer ?? listing.price) as number) : ((listing.buyNowPrice ?? listing.price) as number);
    const saleTypeLabel = listing.type === "OFFERABLE" ? "Make offer" : "Buy now";
    const title = String(listing.title || "Bidra listing").replace(/\s+/g, " ").trim();
    const category = String(listing.category || "Listing").split(" > ")[0];
    const location = String(listing.location || "Australia").replace(/\s+/g, " ").trim();

    return (
      <Link
        key={"mobile-" + listing.id}
        href={"/listings/" + listing.id}
        className="flex min-h-[112px] overflow-hidden rounded-[18px] border border-[#D8E1EA] bg-white shadow-sm md:hidden"
      >
        <div className="relative w-[104px] shrink-0 bg-[#F1F8FA]">
          <div className="absolute left-2 top-2 z-10 rounded-full bg-[#0E7490] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white">
            {saleTypeLabel}
          </div>
          <div className="flex h-full items-center justify-center px-3 pt-6 text-[#0E7490]">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">{category.slice(0, 10)}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <div className="text-[15px] font-black tracking-tight text-[#06132B]">
              {(Number(displayPrice) / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </div>
            <div className="mt-1 line-clamp-2 text-[13px] font-black leading-4 text-[#14213D]">
              {title}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-[#607089]">
            <span className="min-w-0 truncate">{location}</span>
            <span className="shrink-0 text-[#8190A7]">New</span>
          </div>
        </div>
      </Link>
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

        <MarketplaceSection title="Browse categories" action={<Link href="/listings" className="text-sm font-black text-[#0E7490]">View all categories</Link>}>
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection title="Latest listings" className="pb-8 md:pb-8" action={<Link href="/listings?sort=newest" className="text-sm font-black text-[#0E7490]">View all listings</Link>}>
          {listings.length ? (
            <>
              <div className="grid gap-2.5 md:hidden">
                {listings.slice(0, 4).map(renderMobileCompactCard)}
              </div>
              <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {listings.slice(0, 5).map(renderCard)}
              </div>
            </>
          ) : (
            <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />
          )}
        </MarketplaceSection>
</div>
    </ReferencePage>
  );
}

