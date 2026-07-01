"use client";

import Link from "next/link";
import { Badge, Card, CardBody, PageShell, anchorButtonClassName } from "@/components/ui";
import { ListingCard, MarketplaceHero } from "@/components/marketplace";

export type HomeCategory = {
  label: string;
  href: string;
  icon?: string | null;
  count?: number;
};

export type HomeListing = {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  buyNowPrice?: number | null;
  type?: string | null;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: string[] | null;
  status?: string | null;
  offerCount?: number | null;
  currentOffer?: number | null;
  endsAt?: Date | string | null;
  createdAt?: Date | string | null;
  seller?: {
    name?: string | null;
    username?: string | null;
    memberSince?: Date | string | null;
    location?: string | null;
    emailVerified?: boolean | null;
    phoneVerified?: boolean | null;
    phone?: string | null;
  } | null;
  initiallyWatched?: boolean;
};

type BidraHomepageProps = {
  listings: HomeListing[];
  categories: HomeCategory[];
  sellHref: string;
  viewerAuthed: boolean;
};

function formatMoney(cents: number | null | undefined) {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return null;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function firstImage(listing: HomeListing | null | undefined) {
  if (!listing || !Array.isArray(listing.images)) return null;
  const image = listing.images.find((item) => typeof item === "string" && item.trim().length > 0);
  return image || null;
}

function listingTypeLabel(listing: HomeListing) {
  return String(listing.type || "").toUpperCase() === "BUY_NOW" ? "Buy Now" : "Offer";
}

function highestOfferLabel(listing: HomeListing) {
  const currentOffer = formatMoney(listing.currentOffer);
  return currentOffer || null;
}

function CategoryIcon({ icon }: { icon?: string | null }) {
  const label = String(icon || "generic").toLowerCase();
  const common = "h-7 w-7";

  if (label.includes("vehicle")) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15h14l-1.4-4.4A2.5 2.5 0 0 0 15.2 9H8.8a2.5 2.5 0 0 0-2.4 1.6L5 15Z" /><path d="M6 15v3" /><path d="M18 15v3" /><circle cx="8" cy="18" r="1.5" /><circle cx="16" cy="18" r="1.5" /></svg>;
  }
  if (label.includes("home") || label.includes("property")) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>;
  }
  if (label.includes("tool")) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 5 4.5 4.5-9.2 9.2a2.1 2.1 0 0 1-3 0l-1.5-1.5a2.1 2.1 0 0 1 0-3L14.5 5Z" /><path d="m13 6.5 4.5 4.5" /></svg>;
  }
  if (label.includes("electronic")) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="2" /><path d="M11 17h2" /></svg>;
  }
  if (label.includes("sport")) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M5.4 9.5c4.8.4 8.7 4.3 9.1 9.1" /><path d="M18.6 14.5c-4.8-.4-8.7-4.3-9.1-9.1" /></svg>;
  }

  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M12 21V11" /><path d="m4 7 8 4 8-4" /></svg>;
}

function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  const items = (categories.length ? categories : [
    { label: "Vehicles", href: "/listings?category=Vehicles", icon: "vehicles", count: 0 },
    { label: "Home & Living", href: "/listings?category=Home%20%26%20Living", icon: "home", count: 0 },
    { label: "Tools & Equipment", href: "/listings?category=Tools%20%26%20Equipment", icon: "tools", count: 0 },
    { label: "Electronics", href: "/listings?category=Electronics", icon: "electronics", count: 0 },
    { label: "Sports & Outdoors", href: "/listings?category=Sports%20%26%20Outdoors", icon: "sports", count: 0 },
    { label: "Fashion", href: "/listings?category=Fashion", icon: "generic", count: 0 },
  ]).slice(0, 6);

  return (
    <section className="mt-4 rounded-[24px] border border-[#E8E2EF] bg-[#FCFBFE] p-4 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:mt-5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Browse by category</p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-[#17131F]">Popular ways to start</h2>
        </div>
        <Link href="/categories" className="text-sm font-semibold text-[#4F475D] transition hover:text-[#17131F]">View all</Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="flex min-h-[102px] flex-col justify-between rounded-[16px] border border-[#E8E2EF] bg-[#F7F5FA] p-3 text-left transition hover:border-[#D9CEE9] hover:bg-[#F2EBFF]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F2EBFF] text-[#4F2DC9]">
              <CategoryIcon icon={category.icon || category.label} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#17131F]">{category.label}</h3>
              <p className="mt-1 text-[11px] font-medium text-[#6C6778]">{(category.count || 0).toLocaleString("en-AU")} listings</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedListings({ listings }: { listings: HomeListing[] }) {
  const featured = listings.slice(0, 6);

  return (
    <section className="mt-4 rounded-[24px] border border-[#E8E2EF] bg-[#FCFBFE] p-4 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:mt-5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Featured listings</p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-[#17131F]">Fresh picks in the feed</h2>
        </div>
        <Link href="/listings" className="text-sm font-semibold text-[#4F475D] transition hover:text-[#17131F]">Browse all</Link>
      </div>

      {featured.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard
              key={listing.id}
              href={`/listings/${listing.id}`}
              title={listing.title}
              price={formatMoney(listingTypeLabel(listing) === "Buy Now" ? (listing.buyNowPrice ?? listing.price) : (listing.currentOffer ?? listing.price))}
              location={listing.location}
              imageUrl={firstImage(listing)}
              typeLabel={listingTypeLabel(listing) === "Buy Now" ? "Buy Now" : "Offer"}
              highestOffer={highestOfferLabel(listing)}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-4 border-[#E8E2EF] bg-[#F7F5FA]">
          <CardBody className="py-10 text-center">
            <p className="text-lg font-black tracking-[-0.02em] text-[#17131F]">No live listings yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-[#6C6778]">
              Once sellers add items, they will appear here in this feed.
            </p>
            <Link href="/sell/new" className={anchorButtonClassName("primary", "md", "mt-5")}>Create the first listing</Link>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

function HomeTrustBar() {
  const items = [
    ["Clear handovers", "Pickup, postage and payment details stay in one place."],
    ["Trusted profiles", "Seller signals and verification help buyers decide with confidence."],
    ["Fast to list", "Create a listing and share it with buyers in minutes."],
    ["Local and broad", "Browse nearby listings or search further afield."],
  ];

  return (
    <section className="mt-4 grid gap-2 rounded-[24px] border border-[#E8E2EF] bg-white p-3 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([title, text]) => (
        <div key={title} className="flex gap-3 rounded-[16px] border border-[#F0ECF8] bg-[#F7F5FA] p-3">
          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EBFF] text-sm font-black text-[#4F2DC9]">✓</span>
          <div>
            <h3 className="text-sm font-semibold text-[#17131F]">{title}</h3>
            <p className="mt-1 text-xs font-medium leading-5 text-[#6C6778]">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function BidraHomepage({ listings, categories, sellHref, viewerAuthed }: BidraHomepageProps) {
  const heroListing = listings.find((listing) => firstImage(listing)) || listings[0] || null;

  return (
    <PageShell className="mx-auto max-w-[1280px] py-4 sm:py-6 lg:py-8">
      <MarketplaceHero
        listing={heroListing ? {
          id: heroListing.id,
          title: heroListing.title,
          price: heroListing.price,
          buyNowPrice: heroListing.buyNowPrice,
          currentOffer: heroListing.currentOffer,
          type: heroListing.type,
          location: heroListing.location,
          imageUrl: firstImage(heroListing),
          offerCount: heroListing.offerCount,
          endsAt: heroListing.endsAt,
        } : null}
      />

      <CategoryGrid categories={categories} />
      <FeaturedListings listings={listings} />
      <HomeTrustBar />

      <section className="mt-4 rounded-[24px] border border-[#E8E2EF] bg-[#FCFBFE] p-4 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Start selling</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#17131F] sm:text-3xl">Turn a spare item into a simple listing.</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6C6778]">
            Add photos, set your preferred sale method, and keep buyer conversations in one place.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
          <Link href={sellHref} className={anchorButtonClassName("primary", "md")}>{viewerAuthed ? "Sell your item" : "Join and sell"}</Link>
          <Link href="/how-it-works" className={anchorButtonClassName("secondary", "md")}>How it works</Link>
        </div>
      </section>
    </PageShell>
  );
}
