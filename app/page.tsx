import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import HomeCategorySelect from "@/components/home-category-select";

export const revalidate = 10;

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

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 lg:px-6 lg:py-5">
        <section className="overflow-hidden rounded-[34px] border border-[#D8E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F8FF_52%,#EEF4FF_100%)] shadow-sm">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_20rem] lg:items-center lg:p-7">
            <div className="min-w-0">
              <h1 className="max-w-3xl text-[2.35rem] font-extrabold tracking-tight text-[#0F172A] sm:text-[2.8rem] lg:text-[3rem] lg:leading-[1.02]">
                Buy Now or make an offer.
              </h1>
            </div>

            <div className="grid gap-3 rounded-[26px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
              <HomeCategorySelect />
              <div className="grid gap-2">
                <Link href="/listings" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse listings</Link>
                <Link href="/watchlist" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Watchlist</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Latest listings</h2>
            </div>
            <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View all</Link>
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