import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";

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

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Watchlist</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Saved listings</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Keep track of listings you want to revisit, compare, or act on later.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/listings" className="bd-btn bd-btn-primary text-center">
                Browse marketplace
              </Link>
              <Link href="/dashboard" className="bd-btn bd-btn-ghost text-center">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Saved</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{items.length}</div>
            <div className="mt-1 text-sm text-neutral-600">Listings in your watchlist.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{activeCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Still live in the marketplace.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Ended or unavailable</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{endedCount}</div>
            <div className="mt-1 text-sm text-neutral-600">No longer active right now.</div>
          </div>
        </div>

        {!items.length ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="text-xl font-extrabold text-neutral-900">Your watchlist is empty</div>
              <p className="mt-2 text-sm text-neutral-600">
                Save listings from the detail page to keep them handy while you compare options.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/listings" className="bd-btn bd-btn-primary text-center">Browse listings</Link>
                <Link href="/dashboard" className="bd-btn bd-btn-ghost text-center">Go to dashboard</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {items.map(function (item: any) {
              if (!item.listing) return null;
              return (
                <ListingCard
                  key={item.id}
                  listing={item.listing}
                  initiallyWatched={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
