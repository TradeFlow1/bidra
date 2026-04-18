import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

function BenefitPill(props: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{props.title}</div>
      <div className="mt-1 text-sm text-neutral-700">{props.body}</div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const listings = await getLatestListings();

  return (
    <main className="bd-container py-6 pb-14 space-y-6">
      <section className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#ffffff,#f7f8fa)] p-6 shadow-sm sm:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
            Premium local marketplace
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Buy now when you are ready. Make an offer when you want flexibility.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
            Bidra gives local buying and selling a cleaner path to action with Buy Now, offers, and seller-controlled acceptance of the highest offer.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/listings" className="bd-btn bd-btn-primary">
              Browse marketplace
            </Link>
            <Link
              href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"}
              className="bd-btn bd-btn-ghost"
            >
              Start selling
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <BenefitPill
            title="Buy Now"
            body="For buyers who are ready to move instantly."
          />
          <BenefitPill
            title="Make an Offer"
            body="For buyers who want flexibility without messy back-and-forth."
          />
          <BenefitPill
            title="Seller control"
            body="Sellers decide whether to accept the highest offer."
          />
        </div>
      </section>

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
              className="rounded-[24px] border border-black/10 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-lg"
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
            <div className="rounded-[28px] border border-dashed border-black/15 bg-white p-8 text-sm text-neutral-600 shadow-sm">
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

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Why Bidra</div>
          <div className="mt-2 text-xl font-extrabold tracking-tight text-neutral-950">A marketplace built for clearer outcomes.</div>
          <div className="mt-3 text-sm leading-7 text-neutral-600">
            Less enquiry-only friction. More confidence for buyers and more control for sellers.
          </div>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Trust and safety</div>
          <div className="mt-2 text-xl font-extrabold tracking-tight text-neutral-950">Clear marketplace rules matter.</div>
          <div className="mt-3 text-sm leading-7 text-neutral-600">
            Accurate descriptions, prohibited-item rules, and cleaner buying flow help Bidra feel safer and more serious.
          </div>
          <div className="mt-4">
            <Link href="/legal/prohibited-items" className="bd-link font-semibold">Read prohibited items</Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">For sellers</div>
          <div className="mt-2 text-xl font-extrabold tracking-tight text-neutral-950">Create listings that feel more premium.</div>
          <div className="mt-3 text-sm leading-7 text-neutral-600">
            Present listings well, attract decisive buyers, and keep control of the final outcome.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"}
              className="bd-btn bd-btn-primary"
            >
              Create listing
            </Link>
            <Link href="/pricing" className="bd-btn bd-btn-ghost">
              Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
