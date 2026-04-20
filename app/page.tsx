import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import HomeCategorySelect from "@/components/home-category-select";

export const revalidate = 10;

function money(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      type: true,
      condition: true,
      status: true,
      price: true,
      buyNowPrice: true,
      images: true,
      offers: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true },
      },
    },
  });

  const buyNowCount = listings.filter(function (item) { return item.type === "BUY_NOW"; }).length;
  const offerCount = listings.filter(function (item) { return item.type === "OFFERABLE"; }).length;

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-6">
        <section className="overflow-hidden rounded-[36px] border border-[#D8E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F8FF_52%,#EEF4FF_100%)] shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_24rem] lg:items-end lg:p-10">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Bidra marketplace</div>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.4rem] lg:leading-[1.02]">
                Buy now with certainty or compete with your best offer.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#475569] sm:text-base">
                Bidra is a trust-first local marketplace built for clear pricing, confident buying, and premium browsing. Shop instant Buy Now listings or compete in highest-offer listings with transparent seller intent.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/listings?type=BUY_NOW" className="bd-btn bd-btn-primary">Shop Buy Now</Link>
                <Link href="/listings?type=OFFERABLE" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-5 py-2.5 text-sm font-semibold text-[#92400E] shadow-sm transition hover:bg-[#FEF3C7]">Browse Highest Offers</Link>
                <Link href="/sell" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]">Sell on Bidra</Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Buy Now</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">{buyNowCount}</div>
                  <div className="mt-1 text-xs text-[#64748B]">Instant purchase listings available now.</div>
                </div>
                <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Highest Offers</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">{offerCount}</div>
                  <div className="mt-1 text-xs text-[#64748B]">Competitive listings where the best offer wins.</div>
                </div>
                <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Trust first</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">Local</div>
                  <div className="mt-1 text-xs text-[#64748B]">Built around clearer local commerce and stronger buyer confidence.</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
              <div>
                <div className="text-sm font-bold text-[#0F172A]">Start browsing fast</div>
                <div className="mt-1 text-sm text-[#64748B]">Choose a category or jump into the marketplace.</div>
              </div>
              <HomeCategorySelect />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <Link href="/listings" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse all listings</Link>
                <Link href="/watchlist" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Open watchlist</Link>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Featured pricing example</div>
                <div className="mt-1 text-xl font-extrabold text-[#0F172A]">{listings.length ? money(listings[0].buyNowPrice ?? listings[0].price) : "$0.00"}</div>
                <div className="mt-1 text-xs text-[#64748B]">Listings stay easy to scan with stronger price-first presentation.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-[#0F172A]">Buy Now, done properly</div>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">See the price clearly, secure the item quickly, and move straight into the next step without marketplace clutter.</p>
          </div>
          <div className="rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-[#0F172A]">Highest offers with intent</div>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Compete for listings in a cleaner, more premium offer flow where the buyer experience still feels controlled.</p>
          </div>
          <div className="rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-[#0F172A]">Trust-first marketplace</div>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Local selling, visible listing context, and a calmer buying surface that feels more dependable from the first click.</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Fresh in Bidra</div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">Latest listings</h2>
              <p className="mt-2 text-sm text-[#64748B]">The newest local listings across Buy Now and Highest Offers.</p>
            </div>
            <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View marketplace</Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map(function (l) {
              const currentOffer = l.offers && l.offers.length ? l.offers[0].amount : null;
              const displayPrice = l.type === "OFFERABLE"
                ? ((currentOffer ?? l.price) as number)
                : ((l.buyNowPrice ?? l.price) as number);

              return (
                <ListingCard
                  key={l.id}
                  listing={{
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    price: displayPrice,
                    buyNowPrice: l.buyNowPrice,
                    type: l.type,
                    category: l.category,
                    condition: l.condition,
                    location: l.location,
                    images: (l as unknown as { images?: unknown[] | null }).images ?? null,
                    status: (l as unknown as { status?: string | null }).status ?? "ACTIVE",
                  }}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}