import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";

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
  const res = await fetch(`${baseUrl}/api/listings?local=1`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { listings?: ListingLite[] };
  return Array.isArray(data?.listings) ? data.listings.slice(0, 12) : [];
}

const LOGO_SRC = "/brand/bidra-kangaroo-logo.png";

export default async function HomePage() {
  
  const session = await auth();
const listings = await getLatestListings();

  return (
    <main className="bd-container py-6 pb-14">
      {/* HERO */}
<section className="relative overflow-hidden rounded-[28px] shadow-xl">
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: "url(/brand/hero-clouds.png?v=2)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />
  <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />

  <div className="relative px-5 py-8 pb-10 sm:px-10 sm:py-12 text-center">
    <div className="mx-auto flex items-center justify-center sm:-mb-12">
      <div className="mx-auto h-44 sm:h-48 overflow-visible flex items-center justify-center">
  <Image src={LOGO_SRC} alt="Bidra" width={1200} height={1200} priority className="h-44 sm:h-[28rem] w-auto drop-shadow-sm" />
</div>

    </div>

    <h1 className="mx-auto max-w-4xl text-3xl md:text-4xl font-semibold text-black leading-tight px-2">
      Buy, sell and trade across Australia.
    </h1>

    <p className="mx-auto mt-4 max-w-3xl text-base text-white sm:text-lg">
      Explore listings, make offers, and connect with buyers and sellers from all over Australia.
    </p>

    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
      <Link href="/listings" className="bd-btn bd-btn-primary">
        Browse items
      </Link>
      <Link href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"} className="bd-btn bd-btn-primary">
        List an item
      </Link>
    </div>

    <div className="mt-7 text-sm text-white/70">
      Bidra is a marketplace for listings and offers — sellers can accept, decline, or counter.
    </div>
  </div>
</section>
{/* CATEGORIES */}
      <section className="bd-section">
        <div className="flex items-center justify-between gap-3">
          <div className="bd-section-title">Categories</div>
          <Link href="/listings" className="text-sm bd-link">
            View all
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          <Link href="/listings?category=Home%20%26%20Furniture" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Home &amp; Furniture</div>
          </Link>
          <Link href="/listings?category=Tech%20%26%20Electronics" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Tech &amp; Electronics</div>
          </Link>
          <Link href="/listings?category=Fashion%20%26%20Wearables" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Fashion &amp; Wearables</div>
          </Link>
          <Link href="/listings?category=Sports%20%26%20Outdoors" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Sports &amp; Outdoors</div>
          </Link>
          <Link href="/listings?category=Kids%20%26%20Toys" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Kids &amp; Toys</div>
          </Link>
          <Link href="/listings?category=Appliances" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Appliances</div>
          </Link>
          <Link href="/listings?category=Tools%20%26%20DIY" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Tools &amp; DIY</div>
          </Link>
          <Link href="/listings?category=Books%20%26%20Media" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Books &amp; Media</div>
          </Link>
          <Link href="/listings?category=Collectibles%20%26%20Vintage" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Collectibles &amp; Vintage</div>
          </Link>
          <Link href="/listings?category=Seasonal%20Goods" className="bd-card px-3 py-3 hover:shadow-sm">
            <div className="text-sm font-semibold">Seasonal Goods</div>
          </Link>
        </div>

        <div className="mt-3">
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
              <Link href="/sell/new" className="font-semibold bd-link hover:bd-link">
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
        
        <Link href="/legal/prohibited-items" className="bd-link">
          Prohibited items & safety
        </Link>
        .
      </div>
    </main>
  );
}
