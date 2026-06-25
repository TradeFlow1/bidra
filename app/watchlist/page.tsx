import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { ReferencePage, appShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SnapshotRow = {
  watchlistId: string;
  price: number;
  buyNowPrice: number | null;
  currentOfferAmount: number | null;
  status: string;
  createdAt: Date;
};

function formatPrice(cents: number | null | undefined) {
  if (typeof cents !== "number") return "-";
  return "$" + (cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function currentEffectivePrice(listing: any) {
  if (!listing) return null;
  if (typeof listing.buyNowPrice === "number" && listing.buyNowPrice > 0) return listing.buyNowPrice;
  return typeof listing.price === "number" ? listing.price : null;
}

function snapshotEffectivePrice(snapshot?: SnapshotRow) {
  if (!snapshot) return null;
  if (typeof snapshot.buyNowPrice === "number" && snapshot.buyNowPrice > 0) return snapshot.buyNowPrice;
  return typeof snapshot.price === "number" ? snapshot.price : null;
}

function persistedPriceDrop(item: any) {
  const baseline = snapshotEffectivePrice(item?.baselineSnapshot);
  const current = currentEffectivePrice(item?.listing);
  return typeof baseline === "number" && typeof current === "number" && current < baseline;
}

function insightLabel(item: any) {
  const listing = item?.listing;
  if (!listing) return "Unavailable";
  if (listing.status !== "ACTIVE") return "No longer active";
  if (persistedPriceDrop(item)) return "Price dropped since saved";
  if (typeof listing.buyNowPrice === "number" && listing.buyNowPrice > 0 && listing.buyNowPrice < listing.price) return "Buy Now below listed price";
  if (typeof listing.currentOfferAmount === "number" && listing.currentOfferAmount > 0) return "Visible offer activity";
  if ((listing.questions || []).length > 0) return "Public question activity";
  if (listing.updatedAt && new Date(listing.updatedAt).getTime() > new Date(item.createdAt).getTime()) return "Updated since saved";
  return "Watching";
}

function WatchlistInsightCard({ item }: { item: any }) {
  const listing = item?.listing;
  if (!listing) return null;
  const effectivePrice = currentEffectivePrice(listing);
  const baselinePrice = snapshotEffectivePrice(item.baselineSnapshot);
  const lowerBuyNow = typeof listing.buyNowPrice === "number" && listing.buyNowPrice > 0 && listing.buyNowPrice < listing.price;
  const hasVisibleOffer = typeof listing.currentOfferAmount === "number" && listing.currentOfferAmount > 0;
  const questionCount = Array.isArray(listing.questions) ? listing.questions.length : 0;
  const hasPersistedDrop = persistedPriceDrop(item);

  return (
    <Link href={`/listings/${listing.id}`} className="block rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm transition hover:border-[#C7D2FE] hover:bg-[#F8FAFF]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-[#07152E]">{listing.title}</div>
          <div className="mt-1 text-xs font-bold text-[#64748B]">{insightLabel(item)}</div>
          {typeof baselinePrice === "number" && typeof effectivePrice === "number" ? <div className="mt-1 text-[11px] font-bold text-[#64748B]">Saved at {formatPrice(baselinePrice)} · now {formatPrice(effectivePrice)}</div> : null}
        </div>
        <span className="shrink-0 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-black text-[#3730A3]">
          {formatPrice(effectivePrice)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[#3730A3]">
        {hasPersistedDrop ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">Recorded price drop</span> : null}
        {lowerBuyNow ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">Lower Buy Now</span> : null}
        {hasVisibleOffer ? <span className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-2.5 py-1">Offer {formatPrice(listing.currentOfferAmount)}</span> : null}
        {questionCount ? <span className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-2.5 py-1">{questionCount} public Q&amp;A</span> : null}
        {listing.status !== "ACTIVE" ? <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-900">Unavailable</span> : null}
      </div>
    </Link>
  );
}

export default async function WatchlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="bg-white text-[#07152E]">
        <div className="md:hidden">
          <section className="px-4 pb-24 pt-4">
            <div className="rounded-[28px] border border-[#D8E6F8] bg-[#EEF6FF] p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4F46E5]">Saved</div>
              <h1 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.05em]">Save items</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">Sign in to save listings, watch price changes and return to items later.</p>
              <Link href="/auth/login?next=/watchlist" className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-4 text-sm font-black text-white !text-white">
                Sign in
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/auth/register" className="flex min-h-[72px] items-center rounded-[22px] border border-[#D8E1F0] bg-white px-4 text-sm font-black leading-tight text-[#4F46E5] shadow-sm">
                Create account
              </Link>
              <Link href="/listings" className="flex min-h-[72px] items-center rounded-[22px] border border-[#D8E1F0] bg-white px-4 text-sm font-black leading-tight text-[#4F46E5] shadow-sm">
                Browse listings
              </Link>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black tracking-[-0.035em]">Why save?</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">Keep good finds in one place before you buy, offer or message a seller.</p>
            </div>
          </section>
        </div>

        <div className="hidden md:block">
          <ReferencePage>
            <div className={appShell + " space-y-5 py-6 sm:py-8"}>
              <section className="bd-logged-in-hero pb-8">
                <div className="max-w-3xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Saved listings</div>
                  <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Your watchlist</h1>
                  <p className="mt-2 text-sm bd-ink2 sm:text-base">
                    Sign in to save listings, track items you care about, and return to them later.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/auth/login?next=/watchlist" className="bd-btn bd-btn-primary text-center">
                    Sign in to view watchlist
                  </Link>
                  <Link href="/auth/register" className="bd-btn bd-btn-ghost text-center">
                    Create account
                  </Link>
                  <Link href="/listings" className="bd-btn bd-btn-ghost text-center">
                    Browse listings
                  </Link>
                </div>
              </section>
            </div>
          </ReferencePage>
        </div>
      </main>
    );
  }

  const userId = session.user.id;

  const items = await prisma.watchlist.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          buyNowPrice: true,
          currentOfferAmount: true,
          type: true,
          category: true,
          condition: true,
          location: true,
          images: true,
          photos: true,
          status: true,
          updatedAt: true,
          questions: {
            where: { deletedAt: null },
            select: { id: true, createdAt: true },
            take: 10,
            orderBy: { createdAt: "desc" },
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
      },
    },
  });

  const snapshotRows = items.length ? await prisma.$queryRaw<SnapshotRow[]>`
    SELECT DISTINCT ON ("watchlistId") "watchlistId", "price", "buyNowPrice", "currentOfferAmount", "status", "createdAt"
    FROM "WatchlistPriceSnapshot"
    WHERE "watchlistId" IN (${items.map((item) => item.id)})
    ORDER BY "watchlistId", "createdAt" ASC
  ` : [];
  const snapshotsByWatchlistId = new Map(snapshotRows.map((row) => [row.watchlistId, row]));
  const itemsWithSnapshots = items.map((item: any) => ({ ...item, baselineSnapshot: snapshotsByWatchlistId.get(item.id) || null }));

  const activeCount = itemsWithSnapshots.filter(function (x: any) {
    return String(x?.listing?.status ?? "") === "ACTIVE";
  }).length;

  const endedCount = itemsWithSnapshots.filter(function (x: any) {
    return String(x?.listing?.status ?? "") !== "ACTIVE";
  }).length;

  const savedOfferListings = itemsWithSnapshots.filter(function (x: any) {
    return String(x?.listing?.type ?? "") === "OFFERABLE";
  }).length;

  const lowerBuyNowCount = itemsWithSnapshots.filter(function (x: any) {
    return persistedPriceDrop(x) || (typeof x?.listing?.buyNowPrice === "number" && x.listing.buyNowPrice > 0 && x.listing.buyNowPrice < x.listing.price);
  }).length;

  const visibleOfferCount = itemsWithSnapshots.filter(function (x: any) {
    const amount = x?.listing?.currentOfferAmount;
    return typeof amount === "number" && amount > 0;
  }).length;

  const questionActivityCount = itemsWithSnapshots.filter(function (x: any) {
    return Array.isArray(x?.listing?.questions) && x.listing.questions.length > 0;
  }).length;

  const persistedDropCount = itemsWithSnapshots.filter(persistedPriceDrop).length;

  const insightItems = itemsWithSnapshots.filter(function (x: any) {
    const listing = x?.listing;
    if (!listing) return false;
    return listing.status !== "ACTIVE" ||
      persistedPriceDrop(x) ||
      (typeof listing.buyNowPrice === "number" && listing.buyNowPrice > 0 && listing.buyNowPrice < listing.price) ||
      (typeof listing.currentOfferAmount === "number" && listing.currentOfferAmount > 0) ||
      (Array.isArray(listing.questions) && listing.questions.length > 0) ||
      (listing.updatedAt && new Date(listing.updatedAt).getTime() > new Date(x.createdAt).getTime());
  }).slice(0, 6);

  return (
    <ReferencePage>
      <div className={appShell + " space-y-4 pb-24 pt-4 md:space-y-5 md:py-8"}>
        <div className="hidden md:block">
          <AccountNav active="saved" />
        </div>

        <section className="md:hidden">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4F46E5]">Saved</div>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.055em] text-[#07152E]">Watchlist</h1>
            </div>
            <Link href="/listings" className="flex h-11 items-center rounded-2xl bg-[#4F46E5] px-4 text-sm font-black text-white !text-white">
              Browse
            </Link>
          </div>

          <div className="mt-3 rounded-[22px] border border-[#D7E2F1] bg-white px-4 py-3 text-sm text-[#475569] shadow-sm">
            <span className="font-extrabold text-[#07152E]">{itemsWithSnapshots.length}</span> saved
            <span className="ml-2 text-[#607089]">{activeCount} active, {endedCount} unavailable.</span>
          </div>
        </section>

        <section className="bd-logged-in-hero hidden pb-8 md:block">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Saved</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Saved</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Save listings to track items you care about, compare persisted price history, visible offers, public Q&amp;A and availability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:pb-1">
              <Link href="/listings" className="bd-btn bd-btn-primary text-center">
                Browse marketplace
              </Link>
              <Link href="/listings?type=OFFERABLE" className="bd-btn bd-btn-ghost text-center">
                View offer listings
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{itemsWithSnapshots.length}</div><div className="text-xs font-bold text-[#64748B]">Saved listings</div></div>
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{persistedDropCount}</div><div className="text-xs font-bold text-[#64748B]">Recorded drops</div></div>
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{lowerBuyNowCount}</div><div className="text-xs font-bold text-[#64748B]">Lower price signals</div></div>
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{visibleOfferCount}</div><div className="text-xs font-bold text-[#64748B]">Visible offers</div></div>
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{questionActivityCount}</div><div className="text-xs font-bold text-[#64748B]">Public Q&amp;A</div></div>
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-2xl font-black text-[#07152E]">{savedOfferListings}</div><div className="text-xs font-bold text-[#64748B]">Offer listings</div></div>
        </div>

        {insightItems.length ? (
          <section className="rounded-[24px] border border-[#D7E2F1] bg-[#F8FAFF] p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-lg font-black text-[#07152E]">Watchlist alerts</div>
                <p className="mt-1 text-sm font-semibold text-[#64748B]">Saved listings with persisted price drops, visible offers, public question activity or availability changes.</p>
              </div>
              <Link href="/notifications" className="inline-flex h-11 items-center rounded-2xl border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#4F46E5] shadow-sm">
                Open Updates
              </Link>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {insightItems.map((item: any) => <WatchlistInsightCard key={item.id} item={item} />)}
            </div>
          </section>
        ) : null}

        {!itemsWithSnapshots.length ? (
          <div className="rounded-3xl border border-dashed border-[#C8D7EA] bg-[#F8FAFF] px-6 py-12 text-center shadow-sm">
            <div className="mx-auto w-full max-w-xl">
              <div className="text-xl font-extrabold text-[#0F172A]">Your watchlist is empty</div>
              <p className="mt-2 text-sm text-[#526173]">
                Save listings as you browse to track prices, offers, and time windows without contacting the seller until you are ready.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/listings" className="bd-btn bd-btn-primary text-center">Browse listings</Link>
                <Link href="/listings?type=OFFERABLE" className="bd-btn bd-btn-ghost text-center">View offer listings</Link>
                <Link href="/sell/new" className="bd-btn bd-btn-ghost text-center">Sell an item</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {itemsWithSnapshots.map(function (item: any) {
              if (!item.listing) return null;
              return (
                <div key={item.id} className="overflow-hidden rounded-[20px] border border-[#DCE5F2] bg-white shadow-sm transition">
                  {persistedPriceDrop(item) ? <div className="border-b border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">Recorded price drop since saved</div> : null}
                  <div className="overflow-hidden [&_.bd-marketplace-card]:rounded-none [&_.bd-marketplace-card]:border-0 [&_.bd-marketplace-card]:shadow-none [&_.bd-marketplace-card]:hover:translate-y-0 [&_.bd-marketplace-card]:hover:shadow-none [&_.bd-marketplace-card]:hover:bg-white [&_.bd-marketplace-card_.bd-card-meta]:hidden [&_.bd-marketplace-card_.bd-card-seller]:hidden">
                    <ListingCard
                      listing={{
                        ...item.listing,
                        seller: {
                          name: item.listing.seller?.name || item.listing.seller?.username || null,
                          memberSince: item.listing.seller?.createdAt ?? null,
                          location: item.listing.seller?.location ?? null,
                          emailVerified: item.listing.seller?.emailVerified ?? false,
                          phone: item.listing.seller?.phone ?? null,
                        },
                      }}
                      initiallyWatched={true}
                      viewerAuthed={true}
                      showWatchButton={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ReferencePage>
  );
}
