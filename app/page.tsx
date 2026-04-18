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

function StatCard(props: { eyebrow: string; value: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{props.eyebrow}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-950">{props.value}</div>
      <div className="mt-2 text-sm leading-6 text-neutral-600">{props.body}</div>
    </div>
  );
}

function ValueCard(props: { kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-lg">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{props.kicker}</div>
      <div className="mt-2 text-lg font-extrabold tracking-tight text-neutral-950">{props.title}</div>
      <div className="mt-3 text-sm leading-6 text-neutral-600">{props.body}</div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const listings = await getLatestListings();

  return (
    <main className="bd-container py-6 pb-14 space-y-8">
      <section
        className="relative overflow-hidden rounded-[40px] border border-black/10 shadow-2xl"
        style={{
          backgroundImage: "url(/brand/hero-clouds.png?v=2)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.55),rgba(2,6,23,0.76))] pointer-events-none" />

        <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                Premium local marketplace
              </div>

              <div className="mt-5 max-w-4xl">
                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Buy now when you are ready. Make an offer when you want flexibility.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                  Bidra gives local buying and selling a cleaner path to action. Buyers can move instantly with Buy Now or negotiate with offers, while sellers stay in control and can accept the highest offer when the listing ends.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/listings" className="bd-btn bd-btn-primary">
                  Shop the marketplace
                </Link>
                <Link
                  href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"}
                  className="bd-btn bd-btn-ghost !border-white/20 !bg-white/10 !text-white hover:!bg-white/15"
                >
                  Start selling
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 text-sm text-white/75">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Buy Now for instant action</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Make an Offer for flexibility</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Seller accepts highest offer</span>
              </div>
            </div>

            <div className="relative">
              <div className="mx-auto flex max-w-[30rem] justify-center lg:justify-end">
                <div className="pointer-events-none relative flex h-64 w-full items-end justify-center overflow-visible sm:h-72 lg:h-[26rem]">
                  <Image
                    src={LOGO_SRC}
                    alt="Bidra"
                    width={1200}
                    height={1200}
                    priority
                    className="h-56 w-auto select-none drop-shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:h-64 lg:h-[30rem]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <StatCard
              eyebrow="Clear action"
              value="2 ways to buy"
              body="Move instantly with Buy Now or negotiate with offers without falling into endless enquiry threads."
            />
            <StatCard
              eyebrow="Seller control"
              value="Highest offer wins only if accepted"
              body="Sellers stay in charge and decide whether to accept the top offer at the end of the listing."
            />
            <StatCard
              eyebrow="Less friction"
              value="Arrange after commitment"
              body="Pickup, delivery, or postage is sorted after purchase instead of blocking the buying decision upfront."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Why Bidra feels different</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            A marketplace built for decisions, not just enquiries.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
            Traditional classifieds often leave buyers in message loops before anything real happens. Bidra keeps the local marketplace feel people already understand, but adds clearer action paths that help buyers move with confidence and help sellers keep control.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ValueCard
              kicker="Buy Now"
              title="For buyers ready to move"
              body="Secure the item immediately when the listing allows instant purchase."
            />
            <ValueCard
              kicker="Make an Offer"
              title="For flexible negotiation"
              body="Let buyers compete on price while keeping the experience simple and structured."
            />
            <ValueCard
              kicker="Seller acceptance"
              title="For real seller control"
              body="The highest offer matters, but the seller still decides whether to accept it."
            />
          </div>
        </div>

        <div className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#ffffff,#f7f8fa)] p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">How it works</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Simple for first-time users. Better for serious buyers and sellers.
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">1. List with clarity</div>
              <div className="mt-1 text-base font-semibold text-neutral-950">Add photos, price, category, and location.</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">A premium listing starts with clean details and clear intent, not clutter.</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">2. Let buyers choose their path</div>
              <div className="mt-1 text-base font-semibold text-neutral-950">Buy Now for speed. Offers for flexibility.</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">Bidra supports both decisive buying and seller-controlled offer flow.</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">3. Arrange after commitment</div>
              <div className="mt-1 text-base font-semibold text-neutral-950">Pickup, delivery, or postage comes next.</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">Less pre-purchase back-and-forth. More clarity once both sides are committed.</div>
            </div>
          </div>
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

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Trust and safety</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Premium experience starts with clear marketplace rules.
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            Accurate descriptions, clean buying flow, clear prohibited-item rules, and less friction before commitment help Bidra feel safer and more serious from the first click.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/legal/prohibited-items" className="bd-btn bd-btn-ghost">
              Prohibited items
            </Link>
            <Link href="/how-it-works" className="bd-btn bd-btn-ghost">
              How Bidra works
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">For sellers</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Local selling that feels more premium than enquiry-only classifieds.
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            Bidra helps you present listings well, attract decisive buyers, and keep control of the sale outcome with Buy Now and structured offer flow.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={session?.user?.id ? "/sell/new" : "/auth/login?next=/sell/new"}
              className="bd-btn bd-btn-primary"
            >
              Create a premium listing
            </Link>
            <Link href="/pricing" className="bd-btn bd-btn-ghost">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
