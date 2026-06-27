import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { ProductPlaceholder, placeholderKindFromCategory } from "@/components/marketplace-ui";

export type HomeListing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
  type?: string | null;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: unknown;
  status?: string | null;
  offerCount?: number | null;
  currentOffer?: number | null;
  endsAt?: string | Date | null;
  createdAt?: string | Date | null;
  seller?: {
    name?: string | null;
    username?: string | null;
    memberSince?: string | Date | null;
    location?: string | null;
    emailVerified?: boolean | null;
    phoneVerified?: boolean | null;
    phone?: string | null;
  } | null;
  initiallyWatched?: boolean;
};

export type HomeCategory = {
  label: string;
  href: string;
  icon?: string;
  count?: number;
  meta?: string;
};

type BidraHomepageProps = {
  listings: HomeListing[];
  categories: HomeCategory[];
  sellHref: string;
  viewerAuthed: boolean;
};

const defaultCategories: HomeCategory[] = [
  { label: "Vehicles", href: "/listings?category=Vehicles", icon: "vehicles" },
  { label: "Home & Living", href: "/listings?category=Home%20%26%20Living", icon: "home" },
  { label: "Tools & Equipment", href: "/listings?category=Tools%20%26%20Equipment", icon: "tools" },
  { label: "Electronics", href: "/listings?category=Electronics", icon: "electronics" },
  { label: "Sports & Outdoors", href: "/listings?category=Sports%20%26%20Outdoors", icon: "sports" },
];

function money(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return (value / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: value % 100 === 0 ? 0 : 2,
  });
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function readImageUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as { url?: unknown; src?: unknown };
        if (typeof record.url === "string") return record.url;
        if (typeof record.src === "string") return record.src;
      }
      return "";
    })
    .filter(Boolean);
}

function firstImageUrl(listing: HomeListing | null | undefined) {
  if (!listing) return "";
  return readImageUrls(listing.images)[0] || "";
}

function displayPrice(listing: HomeListing) {
  if (listing.type === "OFFERABLE") return Number(listing.currentOffer ?? listing.price ?? 0);
  return Number(listing.buyNowPrice ?? listing.price ?? 0);
}

function suburbLabel(value: string | null | undefined) {
  const raw = cleanText(value);
  if (!raw) return "Australia";
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  return (parts[0] || raw).replace(/^\d{4}\s+/, "").trim() || raw;
}

function saleTypeLabel(listing: HomeListing) {
  if (listing.type === "OFFERABLE" && typeof listing.buyNowPrice === "number") return "Offers + buy now";
  if (listing.type === "OFFERABLE") return "Make an offer";
  return "Buy now";
}

function categoryMeta(category: HomeCategory) {
  if (typeof category.count === "number" && category.count > 0) {
    return `${category.count.toLocaleString("en-AU")} ${category.count === 1 ? "item" : "items"}`;
  }

  return category.meta || "Browse";
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CategoryIcon({ name = "generic" }: { name?: string }) {
  const kind = placeholderKindFromCategory(name);
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

  if (kind === "vehicles") {
    return (
      <svg {...common}>
        <path d="M6 15h12l-1.3-4.2A2.6 2.6 0 0 0 14.2 9H9.8a2.6 2.6 0 0 0-2.5 1.8L6 15Z" />
        <path d="M5 15h14v3H5z" />
        <circle cx="8" cy="18" r="1.4" />
        <circle cx="16" cy="18" r="1.4" />
      </svg>
    );
  }

  if (kind === "home") {
    return (
      <svg {...common}>
        <path d="M4 11.5 12 5l8 6.5V20H5v-8.5Z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (kind === "tools") {
    return (
      <svg {...common}>
        <path d="m14.5 5 4.5 4.5-8.8 8.8a2.5 2.5 0 0 1-3.5 0l-1-1a2.5 2.5 0 0 1 0-3.5L14.5 5Z" />
        <path d="m13 6.5 4.5 4.5" />
      </svg>
    );
  }

  if (kind === "electronics") {
    return (
      <svg {...common}>
        <rect x="6" y="5" width="12" height="14" rx="2" />
        <path d="M9 8h6M9 16h6M12 18h.01" />
      </svg>
    );
  }

  if (kind === "sports") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" />
        <path d="M5.4 9.6c3.6.2 6.8 3 7.1 9.3" />
        <path d="M18.6 14.4c-3.6-.2-6.8-3-7.1-9.3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="m8 15 2.5-3 2 2 2.5-3 2 4" />
    </svg>
  );
}

function HeroListingPanel({ listing, sellHref }: { listing: HomeListing | null; sellHref: string }) {
  if (!listing) {
    return (
      <div className="bd-v5-hero-panel bd-v5-launch-panel">
        <div className="bd-v5-launch-panel__intro">
          <p className="bd-v5-featured__eyebrow">Marketplace opening</p>
          <h2>Marketplace opening</h2>
          <p>Bidra is opening with real listings only. New items will appear here as Australian sellers publish them.</p>
        </div>
        <div className="bd-v5-launch-list" aria-label="Marketplace launch readiness">
          <div>
            <span aria-hidden="true">01</span>
            <strong>Buyer-ready listings</strong>
            <small>Photos, price, suburb and item condition.</small>
          </div>
          <div>
            <span aria-hidden="true">02</span>
            <strong>Local seller profiles</strong>
            <small>Account signals and seller context close to the item.</small>
          </div>
          <div>
            <span aria-hidden="true">03</span>
            <strong>Saved messages</strong>
            <small>Keep item conversations together in Bidra.</small>
          </div>
        </div>
        <Link href={sellHref} className="bd-v5-primary bd-v5-launch-cta">List the first item</Link>
      </div>
    );
  }

  const imageUrl = firstImageUrl(listing);
  const title = cleanText(listing.title);

  return (
    <Link href={`/listings/${listing.id}`} className="bd-v5-hero-panel bd-v5-featured" aria-label={`View ${title}`}>
      <div className="bd-v5-featured__image">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 900px) 92vw, 42vw" className="object-cover" priority />
        ) : (
          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
        )}
        <span className="bd-v5-featured__pill">{saleTypeLabel(listing)}</span>
      </div>
      <div className="bd-v5-featured__body">
        <div>
          <p className="bd-v5-featured__eyebrow">Featured active listing</p>
          <h2>{title}</h2>
          <p>{suburbLabel(listing.location)}{listing.category ? ` - ${String(listing.category).split(" > ")[0]}` : ""}</p>
        </div>
        <div className="bd-v5-featured__price">
          <span>{money(displayPrice(listing))}</span>
          {listing.type === "OFFERABLE" ? <small>{Number(listing.offerCount || 0)} offers</small> : <small>Ready to buy</small>}
        </div>
      </div>
    </Link>
  );
}

function renderListingCard(listing: HomeListing, viewerAuthed: boolean) {
  return (
    <ListingCard
      key={listing.id}
      listing={{
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: displayPrice(listing),
        buyNowPrice: listing.buyNowPrice,
        type: listing.type || undefined,
        category: listing.category || undefined,
        condition: listing.condition,
        location: listing.location,
        images: listing.images,
        status: listing.status,
        offerCount: listing.offerCount,
        currentOffer: listing.currentOffer,
        endsAt: listing.endsAt,
        createdAt: listing.createdAt,
        seller: listing.seller,
      }}
      initiallyWatched={!!listing.initiallyWatched}
      viewerAuthed={viewerAuthed}
      showWatchButton={true}
    />
  );
}

export default function BidraHomepage({ listings, categories, sellHref, viewerAuthed }: BidraHomepageProps) {
  const activeListings = listings.slice(0, 10);
  const heroListing = listings.find((listing) => firstImageUrl(listing)) || listings[0] || null;
  const categoryLinks = (categories.length ? categories : defaultCategories).slice(0, 8);

  return (
    <div className="bd-v5-home">
      <section className="bd-v5-hero" aria-labelledby="home-hero-title">
        <div className="bd-v5-hero__glow" aria-hidden="true" />
        <div className="bd-v5-shell bd-v5-hero__inner">
          <div className="bd-v5-hero__copy">
            <p className="bd-v5-kicker">Australian peer-to-peer marketplace</p>
            <h1 id="home-hero-title">Find quality local items with confidence.</h1>
            <p className="bd-v5-hero__lead">Search active listings across Australia, compare seller details and message directly through Bidra.</p>

            <form action="/listings" method="get" className="bd-v5-search" role="search">
              <span aria-hidden="true"><SearchIcon /></span>
              <input name="q" type="search" placeholder="Search vehicles, tools, furniture, electronics" aria-label="Search listings" />
              <button type="submit">Search</button>
            </form>

            <div className="bd-v5-hero__actions">
              <Link href="/listings" className="bd-v5-primary">Browse listings</Link>
              <Link href={sellHref} className="bd-v5-secondary">Sell an item</Link>
            </div>

            <div className="bd-v5-hero__trust" aria-label="Marketplace trust signals">
              <span>Verified account signals</span>
              <span>Saved messages</span>
              <span>Admin moderation</span>
            </div>
          </div>

          <HeroListingPanel listing={heroListing} sellHref={sellHref} />
        </div>
      </section>

      <main className="bd-v5-main">
        <section className="bd-v5-shell bd-v5-section" aria-labelledby="home-latest-title">
          <div className="bd-v5-section-head">
            <div>
              <p className="bd-v5-kicker bd-v5-kicker--dark">Latest listings</p>
              <h2 id="home-latest-title">Active now on Bidra</h2>
            </div>
            <Link href="/listings?sort=newest" className="bd-v5-text-link">View all listings</Link>
          </div>

          {activeListings.length ? (
            <div className="bd-v5-listing-grid">
              {activeListings.map((listing) => renderListingCard(listing, viewerAuthed))}
            </div>
          ) : (
            <div className="bd-v5-empty">
              <div>
                <p className="bd-v5-kicker bd-v5-kicker--dark">Marketplace opening</p>
                <h3>Listings are opening now</h3>
                <p>Be one of the first sellers to publish on Bidra. New items will appear here with photos, price, suburb and seller details.</p>
                <div className="bd-v5-starting-points" aria-label="Popular starting points">
                  <span>Popular starting points</span>
                  <div>
                    {categoryLinks.slice(0, 4).map((category) => (
                      <Link key={`empty-${category.href}-${category.label}`} href={category.href}>
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bd-v5-empty__actions">
                <Link href={sellHref} className="bd-v5-primary">Sell an item</Link>
                <Link href="/listings" className="bd-v5-secondary bd-v5-secondary--light">Browse categories</Link>
              </div>
            </div>
          )}
        </section>

        <section className="bd-v5-shell bd-v5-section" aria-labelledby="home-category-title">
          <div className="bd-v5-section-head">
            <div>
              <p className="bd-v5-kicker bd-v5-kicker--dark">Browse</p>
              <h2 id="home-category-title">Start with a category</h2>
            </div>
            <Link href="/listings" className="bd-v5-text-link">Browse all</Link>
          </div>

          <div className="bd-v5-category-grid">
            {categoryLinks.map((category) => (
              <Link key={category.href + category.label} href={category.href} className="bd-v5-category-card">
                <span className="bd-v5-category-card__icon"><CategoryIcon name={category.icon || category.label} /></span>
                <span className="bd-v5-category-card__label">{category.label}</span>
                <span className="bd-v5-category-card__meta">{categoryMeta(category)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bd-v5-shell bd-v5-section" aria-labelledby="home-marketplace-title">
          <div className="bd-v5-split">
            <article className="bd-v5-value-card bd-v5-value-card--dark">
              <p className="bd-v5-kicker">For buyers</p>
              <h2 id="home-marketplace-title">Buy with clearer context.</h2>
              <p>Compare real listings by suburb, listing type and seller signals before you make contact.</p>
              <Link href="/listings" className="bd-v5-secondary">Browse listings</Link>
            </article>

            <article className="bd-v5-value-card">
              <p className="bd-v5-kicker bd-v5-kicker--dark">For sellers</p>
              <h2>Sell with a listing that feels ready.</h2>
              <p>Add buyer-ready photos, price, location and details that help serious buyers decide quickly.</p>
              <Link href={sellHref} className="bd-v5-primary">Sell an item</Link>
            </article>
          </div>
        </section>

        <section className="bd-v5-shell bd-v5-trust-strip" aria-label="Bidra trust and safety">
          <div>
            <strong>Australian marketplace</strong>
            <span>Built for local buying and selling.</span>
          </div>
          <div>
            <strong>Message on Bidra</strong>
            <span>Keep item conversations together.</span>
          </div>
          <div>
            <strong>Report unsafe listings</strong>
            <span>Moderation tools stay close by.</span>
          </div>
          <div>
            <strong>Seller signals</strong>
            <span>Profile and verification cues are visible.</span>
          </div>
        </section>
      </main>
    </div>
  );
}
