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
  type?: "OFFERABLE" | "BUY_NOW" | string;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: any;
};

function getRequestBaseUrl() {
  const h = headers();

  const env = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env && env.startsWith("http")) return env.replace(/\/$/, "");

  const xfHost = h.get("x-forwarded-host");
  const rawHost = (xfHost || h.get("host") || "localhost:3000").split(",")[0].trim();
  const rawProto = (h.get("x-forwarded-proto") || (rawHost.includes("localhost") ? "http" : "https")).split(",")[0].trim();

  let host = rawHost;
  if (host === "bidra.com.au") host = "www.bidra.com.au";

  return `${rawProto}://${host}`;
}

async function getLatestListings(): Promise<ListingLite[]> {
  try {
    const baseUrl = getRequestBaseUrl();
    const res = await fetch(`${baseUrl}/api/listings?local=1`, { next: { revalidate: 10 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { listings?: ListingLite[] };
    return Array.isArray(data?.listings) ? data.listings.slice(0, 12) : [];
  } catch {
    return [];
  }
}

const LOGO_SRC = "/brand/bidra-kangaroo-logo.png";

const HOME_CATEGORIES = [
  { label: "Electronics", href: "/listings?category=Electronics" },
  { label: "Home & Furniture", href: "/listings?category=Home%20%26%20Furniture" },
  { label: "Fashion", href: "/listings?category=Fashion" },
  { label: "Appliances", href: "/listings?category=Appliances" },
  { label: "Tools & DIY", href: "/listings?category=Tools%20%26%20DIY" },
  { label: "Sports & Outdoors", href: "/listings?category=Sports%20%26%20Outdoors" },
  { label: "Baby & Kids", href: "/listings?category=Baby%20%26%20Kids" },
  { label: "Vehicles", href: "/listings?category=Vehicles" },
  { label: "Hobbies & Collectibles", href: "/listings?category=Hobbies%20%26%20Collectibles" },
  { label: "Free stuff", href: "/listings?category=Free%20Stuff" }
];

export default async function HomePage() {
  const session = await auth();
  const listings = await getLatestListings();

  return (
    <main className="bd-container py-6 pb-14 space-y-6">

      <section className="bd-section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Browse</div>
            <div className="bd-section-title mt-1">Shop by category</div>
          </div>
          <Link href="/listings" className="text-sm bd-link">
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {HOME_CATEGORIES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[20px] border border-black/10 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="text-sm font-semibold text-neutral-900">{item.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-4">
          <HomeCategorySelectClient />
        </div>
      </section>

      <section className="bd-section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Fresh on Bidra</div>
            <div className="bd-section-title mt-1">Latest listings</div>
          </div>
          <Link href="/listings" className="text-sm bd-link">
            Browse marketplace
          </Link>
        </div>

        <div className="mt-4">
          {listings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/15 bg-white p-8 text-sm text-neutral-600 shadow-sm">
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

      <section className="rounded-[24px] border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-neutral-600">
            Use accurate descriptions, review prohibited items, and arrange details after commitment.
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited items</Link>
            <Link href="/how-it-works" className="bd-link font-semibold">How it works</Link>
            <Link href="/pricing" className="bd-link font-semibold">Pricing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
