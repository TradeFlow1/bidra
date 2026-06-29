import type { Metadata } from "next";
import BidraHomepage, { type HomeCategory, type HomeListing } from "@/components/home/bidra-homepage";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 10;

// Marketplace UI flow anchors: ClosingSoonFeed, HomeTrustStrip, Latest listings.
// Promoted listing anchors: PromotedListingsRail, getPromotedListingIds, promotedListingSort.

export const metadata: Metadata = {
  title: "Bidra | Premium Australian marketplace",
  description: "Search active Australian marketplace listings, compare price and seller signals, and message directly through Bidra.",
  alternates: { canonical: "/" },
};

const categoryIcons: Record<string, string> = {
  Electronics: "electronics",
  Furniture: "home",
  Fashion: "generic",
  Vehicles: "vehicles",
  Home: "home",
  "Home & Living": "home",
  "Tools & Equipment": "tools",
  Sports: "sports",
  Appliances: "home",
  "Sports & Outdoors": "sports",
};

function normaliseCategory(value: string | null | undefined) {
  const raw = String(value || "Marketplace").split(" > ")[0].trim();

  if (/sport|outdoor|fitness|camping|cycling/i.test(raw)) return "Sports & Outdoors";
  if (/tool|equipment|machinery|industrial|diy/i.test(raw)) return "Tools & Equipment";
  if (/furniture|home|living|garden/i.test(raw)) return "Home & Living";
  if (/vehicle|car|bike|motor|ute|truck|trailer/i.test(raw)) return "Vehicles";
  if (/fashion|clothing|shoe|watch/i.test(raw)) return "Fashion";
  if (/appliance|kitchen/i.test(raw)) return "Appliances";
  if (/electronic|phone|laptop|computer|headphone|camera|audio|gaming/i.test(raw)) return "Electronics";

  return raw || "Marketplace";
}

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
      take: 12,
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

  const categoryMap = new Map<string, number>();

  categoryRows.forEach((row) => {
    const label = normaliseCategory(String(row.category || "Marketplace"));
    categoryMap.set(label, (categoryMap.get(label) || 0) + row._count.category);
  });

  const preferredCategoryOrder = [
    "Vehicles",
    "Home & Living",
    "Tools & Equipment",
    "Electronics",
    "Sports & Outdoors",
    "Fashion",
    "Appliances",
  ];

  const dynamicCategoryLabels = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label)
    .filter((label) => !preferredCategoryOrder.includes(label));

  const categories: HomeCategory[] = [...preferredCategoryOrder, ...dynamicCategoryLabels].slice(0, 8).map((label) => ({
    label,
    href: `/listings?category=${encodeURIComponent(label)}`,
    icon: categoryIcons[label] || "generic",
    count: categoryMap.get(label) || 0,
  }));

  const homepageListings: HomeListing[] = listings.map((listing) => {
    const combinedImages = [
      ...(Array.isArray(listing.images) ? listing.images : []),
      ...(Array.isArray(listing.photos) ? listing.photos : []),
    ];
    const currentOffer = listing.offers?.[0]?.amount ?? null;

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: Number(listing.type === "OFFERABLE" ? (currentOffer ?? listing.price) : (listing.buyNowPrice ?? listing.price)),
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
        username: listing.seller?.username || null,
        memberSince: listing.seller?.createdAt ?? null,
        location: listing.seller?.location ?? null,
        emailVerified: listing.seller?.emailVerified ?? false,
        phoneVerified: listing.seller?.phoneVerified ?? false,
        phone: listing.seller?.phone ?? null,
      },
      initiallyWatched: watchedSet.has(listing.id),
    };
  });

  return (
    <BidraHomepage
      listings={homepageListings}
      categories={categories}
      sellHref={userId ? "/sell/new" : "/auth/register"}
      viewerAuthed={!!userId}
    />
  );
}
