import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { CategoryPillGrid, EmptyMarketplaceState, MarketplaceSection, ProductCollage, ReferenceHero, ReferencePage, TrustStrip, appShell } from "@/components/marketplace-redesign";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Bidra marketplace | Buy Now and offers in Australia",
  description: "Browse Bidra for Australian marketplace listings, Buy Now items, offers, pickup, postage, and local handover details.",
  alternates: { canonical: "/" },
};

const categoryIcons: Record<string, string> = {
  Electronics: "⌁",
  Furniture: "▱",
  Fashion: "◌",
  Vehicles: "◇",
  Home: "⌂",
  Sports: "○",
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
    const watchRows = await prisma.watchlist.findMany({ where: { userId, listingId: { in: listings.map((l) => String(l.id)) } }, select: { listingId: true } });
    watchRows.forEach((row) => watchedSet.add(String(row.listingId)));
  }

  const categories = categoryRows.slice(0, 6).map((row) => {
    const raw = String(row.category || "Marketplace").split(" > ")[0];
    return { label: raw, href: `/listings?category=${encodeURIComponent(raw)}`, icon: categoryIcons[raw] || "□", meta: "Explore" };
  });
  while (categories.length < 6) {
    const fallback = ["Electronics", "Furniture", "Fashion", "Vehicles", "Home", "Sports"][categories.length];
    categories.push({ label: fallback, href: `/listings?category=${encodeURIComponent(fallback)}`, icon: categoryIcons[fallback] || "□", meta: "Explore" });
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
        <ReferenceHero
          eyebrow="Australia's local marketplace"
          title={<>Buy, sell and discover amazing local deals.</>}
          description="Buy now. Make offers. Arrange handover with the other person directly in Bidra Messages."
          actions={
            <>
              <Link href="/listings" className="bd-btn bd-btn-primary rounded-2xl px-6">Browse listings</Link>
              <Link href={userId ? "/sell/new" : "/auth/register"} className="bd-btn bd-btn-secondary rounded-2xl px-6">Sell an item</Link>
            </>
          }
        >
          <ProductCollage />
        </ReferenceHero>

        <div className="mt-5"><TrustStrip /></div>

        <MarketplaceSection eyebrow="Browse" title="Popular categories" action={<Link href="/listings" className="text-sm font-black text-[#0B4DFF]">View all listings</Link>}>
          <CategoryPillGrid categories={categories} />
        </MarketplaceSection>

        <MarketplaceSection eyebrow="Fresh finds" title="Latest listings" action={<Link href="/listings?sort=newest" className="bd-btn bd-btn-secondary rounded-2xl">Browse all</Link>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.length ? listings.slice(0, 5).map(renderCard) : <EmptyMarketplaceState title="No listings yet" body="Be the first to list a buyer-ready item with clear photos, price and handover details." href={userId ? "/sell/new" : "/auth/register"} cta="Create a listing" />}
          </div>
        </MarketplaceSection>

        <section className="my-8 overflow-hidden rounded-[32px] bg-[#07152E] p-6 text-white shadow-[0_24px_80px_rgba(7,21,46,0.22)] sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8DB7FF]">Marketplace without escrow</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Keep the sale simple and transparent.</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C9D8EF]">Bidra helps people discover items, make offers, buy now and message. Buyers and sellers arrange payment, pickup, postage and handover directly.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Message before handover", "Agree payment directly", "Keep details in one thread"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black">{item}</div>)}
            </div>
          </div>
        </section>
      </div>
    </ReferencePage>
  );
}
