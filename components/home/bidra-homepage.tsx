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
  return String(listing.type || "").toUpperCase() === "BUY_NOW" ? "Buy Now" : "Auction";
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
    { label: "Property", href: "/listings?category=Property", icon: "property", count: 0 },
    { label: "Tools & Equipment", href: "/listings?category=Tools%20%26%20Equipment", icon: "tools", count: 0 },
    { label: "Home & Garden", href: "/listings?category=Home%20%26%20Garden", icon: "home", count: 0 },
    { label: "Electronics", href: "/listings?category=Electronics", icon: "electronics", count: 0 },
    { label: "Collectables", href: "/listings?category=Collectables", icon: "collectables", count: 0 },
    { label: "Sports & Outdoors", href: "/listings?category=Sports%20%26%20Outdoors", icon: "sports", count: 0 },
    { label: "Business & Industrial", href: "/listings?category=Business%20%26%20Industrial", icon: "business", count: 0 },
  ]).slice(0, 8);

  return (
    <section className="mt-8 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_65px_rgba(18,7,36,0.05)] sm:px-7 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-[-0.045em] text-[var(--bd-ink)]">Popular categories</h2>
        <Link href="/categories" className="text-sm font-black text-[var(--bd-purple-dark)] hover:underline">View all categories</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {items.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group flex min-h-[118px] flex-col items-center justify-center rounded-[16px] border border-[#E8E2F4] bg-[#FBFAFF] px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#C4B5FD] hover:bg-white hover:shadow-[0_18px_45px_rgba(43,16,85,0.10)]"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#251B3D] shadow-sm ring-1 ring-[#E8E2F4] group-hover:text-[var(--bd-purple-dark)]">
              <CategoryIcon icon={category.icon || category.label} />
            </div>
            <h3 className="mt-3 line-clamp-2 text-[12px] font-black leading-tight text-[#1C1430]">{category.label}</h3>
            <p className="mt-1 text-[10px] font-semibold text-[#6D647A]">{(category.count || 0).toLocaleString("en-AU")} listings</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedListings({ listings }: { listings: HomeListing[] }) {
  const featured = listings.slice(0, 6);

  return (
    <section className="mt-8 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_65px_rgba(18,7,36,0.05)] sm:px-7 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.045em] text-[var(--bd-ink)]">Featured listings</h2>
          <div className="mt-4 flex gap-6 text-xs font-bold text-[#6D647A]">
            <span className="border-b-2 border-[#7C3AED] pb-2 text-[#7C3AED]">All</span>
            <span>Auctions</span>
            <span>Buy Now</span>
          </div>
        </div>
        <Link href="/listings" className="hidden text-sm font-black text-[var(--bd-purple-dark)] hover:underline sm:inline-flex">View all listings</Link>
      </div>

      {featured.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {featured.map((listing) => (
            <ListingCard
              key={listing.id}
              href={`/listings/${listing.id}`}
              title={listing.title}
              price={formatMoney(listingTypeLabel(listing) === "Buy Now" ? (listing.buyNowPrice ?? listing.price) : (listing.currentOffer ?? listing.price))}
              location={listing.location}
              imageUrl={firstImage(listing)}
              typeLabel={listingTypeLabel(listing)}
              highestOffer={highestOfferLabel(listing)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-xl font-black tracking-[-0.04em] text-[var(--bd-ink)]">No live listings yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[var(--bd-muted)]">
              Once sellers add items, they will appear here in the approved marketplace layout.
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
    ["Safe & secure", "Your safety is our priority with secure messaging and trusted users."],
    ["Australia wide", "Buy and sell locally or across Australia with ease."],
    ["Free to list", "List your items for free and reach thousands of buyers."],
    ["Trusted community", "Join a growing community of honest buyers and sellers."],
  ];

  return (
    <section className="mt-5 grid gap-3 rounded-[24px] border border-[#E8E2F4] bg-[#FBFAFF] p-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([title, text]) => (
        <div key={title} className="flex gap-3 rounded-[18px] bg-white p-4 shadow-sm">
          <Badge tone="offer">B</Badge>
          <div>
            <h3 className="text-sm font-black text-[#1C1430]">{title}</h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#6D647A]">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function BidraHomepage({ listings, categories, sellHref, viewerAuthed }: BidraHomepageProps) {
  const heroListing = listings.find((listing) => firstImage(listing)) || listings[0] || null;

  return (
    <PageShell className="max-w-[1440px] py-6 sm:py-8 lg:py-10">
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

      <section className="mt-8 rounded-[28px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_18px_55px_rgba(18,7,36,0.08)] sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">Start selling</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-4xl">Turn your item into a serious listing.</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--bd-muted)]">
            Add photos, set Buy Now or Auctions, and keep buyer messages in one place.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:flex lg:mt-0">
          <Link href={sellHref} className={anchorButtonClassName("primary", "lg")}>{viewerAuthed ? "Sell your item" : "Join and sell"}</Link>
          <Link href="/how-it-works" className={anchorButtonClassName("secondary", "lg")}>How it works</Link>
        </div>
      </section>
    </PageShell>
  );
}
