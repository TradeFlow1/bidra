import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/watchlist");

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

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
    <main className="bd-container py-4 sm:py-8">
      <div className="container max-w-5xl space-y-3 sm:space-y-4">
        <AccountNav active="saved" />
        <div className="rounded-[24px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Watchlist</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Saved listings</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Save listings to track items you care about, keep an eye on offer movement, and spot ending windows before they close.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/listings" className="bd-btn bd-btn-primary text-center">
                Browse marketplace
              </Link>
              <Link href="/listings?type=OFFERABLE" className="bd-btn bd-btn-ghost text-center">
                View offer listings
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#D7E2F1] bg-white px-4 py-3 text-sm text-[#334155] shadow-sm">
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {items.map(function (item: any) {
              if (!item.listing) return null;
              return (
                <ListingCard
                  key={item.id}
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
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}


