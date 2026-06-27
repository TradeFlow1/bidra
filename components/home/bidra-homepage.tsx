"use client";

import Link from "next/link";
import { Badge, Card, CardBody, PageShell, anchorButtonClassName } from "@/components/ui";
import { ListingCard, MarketplaceHero, StatCard, TrustStrip } from "@/components/marketplace";

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

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function firstImage(listing: HomeListing) {
  if (!Array.isArray(listing.images)) return null;
  const image = listing.images.find((item) => typeof item === "string" && item.trim().length > 0);
  return image || null;
}

function listingTypeLabel(listing: HomeListing) {
  return String(listing.type || "").toUpperCase() === "BUY_NOW" ? "Buy Now" : "Offers";
}

function highestOfferLabel(listing: HomeListing) {
  const currentOffer = formatMoney(listing.currentOffer);
  return currentOffer || null;
}

function CategoryIcon({ icon }: { icon?: string | null }) {
  const label = String(icon || "generic").toLowerCase();

  if (label.includes("vehicle")) return <span aria-hidden="true">🚗</span>;
  if (label.includes("home")) return <span aria-hidden="true">🏠</span>;
  if (label.includes("tool")) return <span aria-hidden="true">🛠</span>;
  if (label.includes("sport")) return <span aria-hidden="true">🏕</span>;
  if (label.includes("electronic")) return <span aria-hidden="true">📱</span>;

  return <span aria-hidden="true">●</span>;
}

function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  const items = categories.length ? categories : [
    { label: "Vehicles", href: "/listings?category=Vehicles", icon: "vehicles", count: 0 },
    { label: "Home & Living", href: "/listings?category=Home%20%26%20Living", icon: "home", count: 0 },
    { label: "Tools & Equipment", href: "/listings?category=Tools%20%26%20Equipment", icon: "tools", count: 0 },
    { label: "Electronics", href: "/listings?category=Electronics", icon: "electronics", count: 0 },
  ];

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">Browse by category</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-4xl">Find the right section fast</h2>
        </div>
        <Link href="/categories" className="hidden text-sm font-black text-[var(--bd-purple-dark)] hover:underline sm:inline-flex">
          View all
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 8).map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group rounded-[24px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_14px_40px_rgba(18,7,36,0.06)] transition hover:-translate-y-1 hover:border-[#cbb8e8] hover:shadow-[0_24px_70px_rgba(43,16,85,0.12)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bd-purple-soft)] text-xl text-[var(--bd-purple-dark)]">
                <CategoryIcon icon={category.icon} />
              </div>
              <Badge tone="neutral">{category.count || 0} live</Badge>
            </div>
            <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-[var(--bd-ink)]">{category.label}</h3>
            <p className="mt-1 text-sm font-semibold text-[var(--bd-muted)]">Browse active listings</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedListings({ listings }: { listings: HomeListing[] }) {
  const featured = listings.slice(0, 8);

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">Latest listings</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-4xl">Fresh items across Australia</h2>
        </div>
        <Link href="/listings" className="hidden text-sm font-black text-[var(--bd-purple-dark)] hover:underline sm:inline-flex">
          Browse all
        </Link>
      </div>

      {featured.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((listing) => (
            <ListingCard
              key={listing.id}
              href={`/listings/${listing.id}`}
              title={listing.title}
              price={formatMoney(listingTypeLabel(listing) === "Buy Now" ? (listing.buyNowPrice ?? listing.price) : listing.price)}
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
              Once sellers add items, they will appear here in the new marketplace layout.
            </p>
            <Link href="/sell/new" className={anchorButtonClassName("primary", "md", "mt-5")}>
              Create the first listing
            </Link>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

function HowBidraWorks() {
  const steps = [
    {
      title: "Browse",
      text: "Search live listings by location, category and sale type.",
    },
    {
      title: "Offer or buy",
      text: "Use Buy Now where available, or make an offer and track the highest offer.",
    },
    {
      title: "Message safely",
      text: "Keep handover details, questions and order records together in Bidra.",
    },
  ];

  return (
    <section className="mt-10 grid gap-4 lg:grid-cols-3">
      {steps.map((step, index) => (
        <Card key={step.title}>
          <CardBody>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--bd-purple-soft)] text-sm font-black text-[var(--bd-purple-dark)]">
              {index + 1}
            </div>
            <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-[var(--bd-ink)]">{step.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--bd-muted)]">{step.text}</p>
          </CardBody>
        </Card>
      ))}
    </section>
  );
}

export default function BidraHomepage({ listings, categories, sellHref, viewerAuthed }: BidraHomepageProps) {
  const listingCount = listings.length;
  const offerListingCount = listings.filter((listing) => listingTypeLabel(listing) === "Offers").length;
  const buyNowCount = listings.filter((listing) => listingTypeLabel(listing) === "Buy Now").length;

  return (
    <PageShell className="py-5 sm:py-7 lg:py-8">
      <MarketplaceHero />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Live listings loaded" value={String(listingCount)} />
        <StatCard label="Offer listings" value={String(offerListingCount)} />
        <StatCard label="Buy Now listings" value={String(buyNowCount)} />
      </div>

      <div className="mt-5">
        <TrustStrip />
      </div>

      <section className="mt-10 rounded-[28px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_18px_55px_rgba(18,7,36,0.08)] sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">Start selling</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-4xl">Turn your item into a serious listing.</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--bd-muted)]">
            Add photos, set Buy Now or Offers, and keep buyer messages in one place.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:flex lg:mt-0">
          <Link href={sellHref} className={anchorButtonClassName("primary", "lg")}>
            {viewerAuthed ? "Sell your item" : "Join and sell"}
          </Link>
          <Link href="/how-it-works" className={anchorButtonClassName("secondary", "lg")}>
            How it works
          </Link>
        </div>
      </section>

      <CategoryGrid categories={categories} />
      <FeaturedListings listings={listings} />
      <HowBidraWorks />
    </PageShell>
  );
}