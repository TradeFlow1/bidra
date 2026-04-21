import Image from "next/image";
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6 lg:py-4">
        <section className="overflow-hidden rounded-[30px] border border-[#D8E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F8FF_52%,#EEF4FF_100%)] shadow-sm">
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.55fr)_18rem] lg:items-center lg:p-5">
            <div className="relative flex min-h-[9rem] items-center overflow-hidden rounded-[24px] border border-[#D8E1F0] bg-[#EFF4FB] px-5 py-4 sm:min-h-[10rem] sm:px-6 lg:min-h-[11rem] lg:px-7">
              <Image
                src="/brand/hero-clouds.png"
                alt=""
                fill
                priority
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,249,252,0.78)_0%,rgba(247,249,252,0.55)_42%,rgba(247,249,252,0.28)_100%)]" />
              <div className="relative z-10 h-[7rem] w-[24rem] sm:h-[8rem] sm:w-[28rem] lg:h-[9rem] lg:w-[32rem] xl:h-[9.75rem] xl:w-[35rem]">
                <Image
                  src="/brand/bidra-kangaroo-logo-tight.png"
                  alt="Bidra"
                  fill
                  priority
                  className="object-contain object-left drop-shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
                  sizes="(max-width: 640px) 24rem, (max-width: 1024px) 28rem, (max-width: 1280px) 32rem, 35rem"
                />
              </div>
            </div>

            <div className="grid gap-2 rounded-[24px] border border-[#D8E1F0] bg-white p-3 shadow-sm">
              <HomeCategorySelect />
              <div className="grid gap-2">
                <Link href="/listings" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse listings</Link>
                <Link href="/watchlist" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Watchlist</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Latest listings</h2>
            </div>
            <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View all</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
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