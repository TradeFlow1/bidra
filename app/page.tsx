import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import HomeCategorySelect from "@/components/home-category-select";

export const revalidate = 10;

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
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
      _count: {
        select: { offers: true },
      },
      seller: {
        select: {
          username: true,
          name: true,
          createdAt: true,
          location: true,
          emailVerified: true,
          phone: true,
        },
      },
    },
  });

  const categoryRows = await prisma.listing.groupBy({
    by: ["category"],
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 24,
  });

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watchRows = await prisma.watchlist.findMany({
      where: {
        userId: userId,
        listingId: { in: listings.map((l) => String(l.id)) },
      },
      select: { listingId: true },
    });
    for (let i = 0; i < watchRows.length; i += 1) {
      watchedSet.add(String(watchRows[i].listingId));
    }
  }

  const topLevelCategoryCounts = new Map<string, number>();
  for (let i = 0; i < categoryRows.length; i += 1) {
    const raw = String(categoryRows[i].category || "").trim();
    if (!raw) continue;
    const top = raw.indexOf(" > ") >= 0 ? raw.split(" > ")[0] : raw;
    topLevelCategoryCounts.set(top, (topLevelCategoryCounts.get(top) || 0) + Number(categoryRows[i]._count.category || 0));
  }
  const featuredCategories = Array.from(topLevelCategoryCounts.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 6);

  const latestListings = listings.slice(0, 12);
  const usedListingIds = new Set(latestListings.map(function (l) { return l.id; }));
  const offerableListings = listings
    .filter(function (l) { return l.type === "OFFERABLE" && !usedListingIds.has(l.id); })
    .slice(0, 4);
  for (let i = 0; i < offerableListings.length; i += 1) usedListingIds.add(offerableListings[i].id);
  const buyNowListings = listings
    .filter(function (l) { return l.type !== "OFFERABLE" && !usedListingIds.has(l.id); })
    .slice(0, 4);

  function renderCard(l: (typeof listings)[number]) {
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
          endsAt: (l as unknown as { endsAt?: string | Date | null }).endsAt ?? null,
          offerCount: l._count?.offers ?? 0,
          currentOffer: currentOffer,
          seller: {
            name: l.seller?.name || l.seller?.username || null,
            memberSince: l.seller?.createdAt ?? null,
            location: l.seller?.location ?? null,
            emailVerified: l.seller?.emailVerified ?? false,
            phone: l.seller?.phone ?? null,
          },
        }}
        initiallyWatched={watchedSet.has(l.id)}
        viewerAuthed={!!userId}
        showWatchButton={true}
      />
    );
  }

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
                <Link href="/listings" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse active listings</Link>
                <Link href="/auth/register" className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Create a free account</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EDF7] pb-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Explore</div>
              <h2 className="mt-1 text-[1.5rem] font-extrabold tracking-tight text-[#0F172A]">Discover active marketplace categories</h2>
            </div>
            <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">
              View all
            </Link>
          </div>
          {featuredCategories.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCategories.map(function (entry) {
                return (
                  <Link
                    key={entry[0]}
                    href={"/listings?category=" + encodeURIComponent(entry[0])}
                    className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white"
                  >
                    <span>{entry[0]}</span>
                    <span className="ml-2 text-xs font-medium text-[#64748B]">({entry[1]})</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#64748B]">Categories will appear as sellers publish active Buy Now and offer listings.</p>
          )}
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EDF7] pb-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Start buying</div>
              <h2 className="mt-1 text-[1.9rem] font-extrabold tracking-tight text-[#0F172A]">Latest active listings</h2>
            </div>

            <Link href="/listings" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">
              View all
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latestListings.length ? latestListings.map(renderCard) : (
              <p className="col-span-full rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">No active listings yet. Create a free account and start the first trusted listing.</p>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EDF7] pb-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Offer listings</div>
              <h2 className="mt-1 text-[1.5rem] font-extrabold tracking-tight text-[#0F172A]">Make seller-reviewed offers</h2>
            </div>
            <Link href="/listings?type=OFFERABLE" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">
              View all
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {offerableListings.length ? offerableListings.map(renderCard) : (
              <p className="col-span-full rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">No offer listings right now. Sellers can create timed-offer listings from the sell flow.</p>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EDF7] pb-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Buy now listings</div>
              <h2 className="mt-1 text-[1.5rem] font-extrabold tracking-tight text-[#0F172A]">Buy Now activation</h2>
            </div>
            <Link href="/listings?type=BUY_NOW" className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">
              View all
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {buyNowListings.length ? buyNowListings.map(renderCard) : (
              <p className="col-span-full rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">No Buy Now listings right now. Create a listing with a clear fixed price to activate buyers faster.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
