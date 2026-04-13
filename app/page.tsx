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
      <section
        className="relative overflow-hidden rounded-[32px] border border-black/10 shadow-xl"
        style={{
          backgroundImage: "url(/brand/hero-clouds.png?v=2)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />

        <div className="relative z-10 px-5 py-8 pb-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto flex items-center justify-center sm:-mb-12">
            <div className="mx-auto flex h-44 items-center justify-center overflow-visible sm:h-48">
              <Image
                src={LOGO_SRC}
                alt="Bidra"
                width={1200}
                height={1200}
                priority
                className="pointer-events-none h-44 w-auto select-none drop-shadow-sm sm:h-[28rem]"
              />
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              Trust-first marketplace
            </div>

            <h1 className="mx-auto mt-4 max-w-4xl px-2 text-3xl font-semibold leading-tight text-white md:text-5xl">
              Buy now, make offers, and sell locally with less friction.
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-base text-white/90 sm:text-lg">
              Bidra keeps marketplace selling simple: list an item, let buyers buy now or make offers, and arrange pickup, delivery, or postage after purchase.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/listings" className="bd-btn bd-btn-primary">
                Browse items
              </Link>
              <Link
                href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"}
                className="bd-btn bd-btn-primary"
              >
                List an item
              </Link>
            </div>

            <div className="mt-7 text-sm text-white/75">
              Sellers choose whether to accept the highest offer. No scheduling clutter. Clear action flow.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">1. List simply</div>
          <div className="mt-1 text-base font-semibold text-neutral-950">Add photos, price, category, and location.</div>
          <div className="mt-2 text-sm text-neutral-600">No pickup scheduling required upfront.</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">2. Buy now or offer</div>
          <div className="mt-1 text-base font-semibold text-neutral-950">Buyers can act fast or negotiate.</div>
          <div className="mt-2 text-sm text-neutral-600">Great for fixed-price sales and seller-controlled offer flows.</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">3. Arrange after purchase</div>
          <div className="mt-1 text-base font-semibold text-neutral-950">Finalize pickup, delivery, or postage directly.</div>
          <div className="mt-2 text-sm text-neutral-600">Cleaner process, less back-and-forth before commitment.</div>
        </div>
      </section>

      <section className="bd-section">
        <div className="flex items-center justify-between gap-3">
          <div className="bd-section-title">Browse by category</div>
          <Link href="/listings" className="text-sm bd-link">
            View all
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {HOME_CATEGORIES.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
              <div className="text-sm font-semibold text-neutral-900">{item.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-3">
          <HomeCategorySelectClient />
        </div>
      </section>

      <section className="bd-section">
        <div className="flex items-center justify-between gap-3">
          <div className="bd-section-title">Latest listings</div>
          <Link href="/listings" className="text-sm bd-link">
            Browse marketplace
          </Link>
        </div>

        <div className="mt-3">
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-white p-6 text-sm text-neutral-600">
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

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-neutral-950">Trust and safety</div>
        <div className="mt-1 text-sm text-neutral-600">
          Keep transactions clear, use accurate descriptions, and review prohibited items before listing.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/legal/prohibited-items" className="bd-btn bd-btn-ghost">
            Prohibited items
          </Link>
          <Link href="/how-it-works" className="bd-btn bd-btn-ghost">
            How Bidra works
          </Link>
        </div>
      </section>
    </main>
  );
}
