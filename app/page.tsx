import Link from "next/link";
import { headers } from "next/headers";

import ListingCard from "@/components/listing-card";
import HomeCategorySelectClient from "@/components/home-category-select-client";

type ListingLite = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
  type?: "FIXED_PRICE" | "BUY_NOW" | string;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: any;
};

function money(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function getRequestBaseUrl() {
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getLatestListings(): Promise<ListingLite[]> {
  const baseUrl = getRequestBaseUrl();
  const res = await fetch(`${baseUrl}/api/listings`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { listings?: ListingLite[] };
  return Array.isArray(data?.listings) ? data.listings.slice(0, 12) : [];
}

const LOGO_SRC = "/brand/logo/Bidra_cropped_1.png";

export default async function HomePage() {
  const listings = await getLatestListings();

  return (
    <main className="bd-container py-6 pb-14">
      {/* HERO */}
      <section className="bd-hero">
        <div className="flex flex-col gap-3">
          <div className="bd-hero-row">
            <div className="bd-hero-logoWrap">
              <img src={LOGO_SRC} alt="Bidra" className="bd-hero-logo" />
            </div>
          </div>

          <div className="bd-hero-eyebrow">AUSTRALIA-WIDE • LIST • OFFER • SELLER DECIDES</div>

          <h1 className="bd-hero-h1">Australia&#39;s marketplace for buying and selling.</h1>
          <p className="bd-hero-p">
            Browse items, make an offer, and trade directly.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/listings" className="bd-btn bd-btn-primary">
              Browse items
            </Link>
            <Link href="/auth/login?next=%2Fsell%2Fnew" className="bd-btn bd-btn-primary">
              List an item
            </Link>
          </div>

          <div className="bd-hero-fine">
            Bidra is a marketplace platform — sellers choose whether to accept, decline, or counter an offer.
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bd-section">
        <div className="bd-section-title">Categories</div>
        <div className="mt-3 bd-card p-4">
          <HomeCategorySelectClient />
        </div>
      </section>

      {/* LATEST */}
      <section className="bd-section">
        <div className="bd-section-title">Latest listings</div>

        <div className="mt-3">
          {listings.length === 0 ? (
            <div className="bd-card p-6 bd-ink2">
              No listings yet. Be the first to{" "}
              <Link href="/auth/login?next=%2Fsell%2Fnew" className="font-semibold bd-link hover:bd-link">
                create a listing
              </Link>
              .
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={{
                    id: l.id,
                    title: l.title,
                    description: l.description ?? null,
                    price: l.price,
                    buyNowPrice: l.buyNowPrice ?? null,
                    type: l.type ?? undefined,
                    category: l.category ?? undefined,
                    condition: l.condition ?? undefined,
                    location: l.location ?? undefined,
                    images: l.images ?? undefined,
                  }}
/>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SAFETY (minimal trust cue) */}
      <div className="mt-6 text-xs bd-ink2">
        <span className="font-semibold bd-ink">Safety:</span>{" "}
        Meet in a public place and avoid off-platform prepayment.{" "}
        <Link href="/legal/prohibited-items" className="bd-link">
          Prohibited items & safety
        </Link>
        .
      </div>
    </main>
  );
}
