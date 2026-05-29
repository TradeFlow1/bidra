import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
          type: true,
          category: true,
          condition: true,
          location: true,
          images: true,
          status: true,
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

  const activeCount = items.filter(function (x: any) {
    return String(x?.listing?.status ?? "") === "ACTIVE";
  }).length;

  const endedCount = items.filter(function (x: any) {
    return String(x?.listing?.status ?? "") !== "ACTIVE";
  }).length;

  const savedOfferListings = items.filter(function (x: any) {
    return String(x?.listing?.type ?? "") === "OFFERABLE";
  }).length;

  const savedBuyNowListings = items.filter(function (x: any) {
    return String(x?.listing?.type ?? "") !== "OFFERABLE";
  }).length;

  const nowMs = Date.now();
  const endingSoonCount = items.filter(function (x: any) {
    if (String(x?.listing?.status ?? "") !== "ACTIVE") return false;
    const endsAtRaw = (x?.listing as any)?.endsAt;
    if (!endsAtRaw) return false;
    const endsAtMs = new Date(endsAtRaw).getTime();
    if (!Number.isFinite(endsAtMs)) return false;
    const diff = endsAtMs - nowMs;
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  }).length;

  return (
    <ReferencePage>
      <div className={appShell + " space-y-4 pb-24 pt-4 md:space-y-5 md:py-8"}>
        <AccountNav active="saved" />
        <section className="bd-logged-in-hero pb-5 md:pb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Saved</div>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Saved</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Save listings to track items you care about, keep an eye on offer movement, and spot ending windows before they close.
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

        <div className="rounded-[22px] border border-[#D7E2F1] bg-white px-4 py-2 text-sm text-[#475569] shadow-sm">
          <span className="font-extrabold text-[#07152E]">{items.length}</span> saved listings.
          <span className="ml-2 text-[#607089]">{activeCount} active, {endedCount} unavailable.</span>
        </div>

        {!items.length ? (
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
            {items.map(function (item: any) {
              if (!item.listing) return null;
              return (
                <div key={item.id} className="overflow-hidden rounded-[20px] border border-[#DCE5F2] bg-white shadow-sm transition">
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



