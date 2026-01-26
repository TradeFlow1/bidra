import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { labelCategory } from "@/lib/labels";

function dollars(cents: number | null | undefined) {
  if (typeof cents !== "number") return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Watchlist</h1>
              <p className="mt-2 text-sm bd-ink2">Save listings you want to come back to.</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link href="/listings" className="bd-btn bd-btn-primary">Browse</Link>
              <Link href="/auth/login?next=/watchlist" className="bd-btn bd-btn-ghost">Sign in</Link>
            </div>
          </div>

          <div className="mt-6 bd-card p-6">
            <div className="text-base font-semibold bd-ink">Sign in to use your watchlist.</div>
            <div className="mt-1 text-sm bd-ink2">
              When you’re signed in, tap the heart on any listing to save it here.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/auth/login?next=/watchlist" className="bd-btn bd-btn-primary">Sign in</Link>
              <Link href="/auth/register" className="bd-btn bd-btn-ghost">Create account</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const gate = await requireAdult(session as any);
  if (!gate.ok && (gate as any).reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/account");

  const userId = session.user.id;

  async function removeWatch(formData: FormData) {
    "use server";
    const listingId = String(formData.get("listingId") || "").trim();
    if (!listingId) return;

    const session2 = await auth();
    if (!session2?.user?.id) return;

    await prisma.watchlist.deleteMany({
      where: { userId: session2.user.id, listingId },
    });

    revalidatePath("/watchlist");
  }

  const items = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          type: true,
          price: true,
          status: true,
        },
      },
    },
  });

  // If listings were deleted/sold, keep the watch row but show it as unavailable.
  const active = items.filter((w) => w.listing?.status === "ACTIVE");
  const inactive = items.filter((w) => w.listing?.status !== "ACTIVE");

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Watchlist</h1>
            <p className="mt-2 text-sm bd-ink2">Listings you’ve saved.</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link href="/listings" className="bd-btn bd-btn-primary">Browse</Link>
            <Link href="/sell/new" className="bd-btn bd-btn-ghost">Sell</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {items.length === 0 ? (
            <div className="bd-card p-6">
              <div className="text-base font-semibold bd-ink">No watched listings yet.</div>
              <div className="mt-1 text-sm bd-ink2">
                Tip: tap the ♥ (heart) on any listing to save it here.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/listings" className="bd-btn bd-btn-primary">Browse listings</Link>
                <Link href="/dashboard" className="bd-btn bd-btn-ghost">Dashboard</Link>
              </div>
            </div>
          ) : (
            <>
              {active.map((w) => (
                <div key={w.id} className="bd-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-extrabold bd-ink">
                      <Link href={`/listings/${w.listing.id}`} className="hover:underline underline-offset-4">
                        {w.listing.title}
                      </Link>
                    </div>

                    <div className="mt-1 text-sm bd-ink2">
                      {w.listing.category ? <span>{labelCategory(w.listing.category)}</span> : null}
                      {w.listing.category && w.listing.location ? <span>  ·  </span> : null}
                      {w.listing.location ? <span>{w.listing.location}</span> : null}
                      {(w.listing.category || w.listing.location) && w.listing.type ? <span>  ·  </span> : null}
                      {w.listing.type ? <span>{w.listing.type}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <div className="font-extrabold bd-ink">{dollars(w.listing.price)} AUD</div>
                    <Link href={`/listings/${w.listing.id}`} className="bd-btn bd-btn-primary">View</Link>

                    <form action={removeWatch}>
                      <input type="hidden" name="listingId" value={w.listing.id} />
                      <button type="submit" className="bd-btn bd-btn-ghost">Remove</button>
                    </form>
                  </div>
                </div>
              ))}

              {inactive.length ? (
                <div className="bd-card p-6">
                  <div className="text-base font-semibold bd-ink">Unavailable listings</div>
                  <div className="mt-1 text-sm bd-ink2">
                    These listings are no longer active (sold/removed). You can remove them.
                  </div>

                  <div className="mt-4 grid gap-2">
                    {inactive.map((w) => (
                      <div key={w.id} className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-sm bd-ink2">
                          <span className="font-semibold bd-ink">{w.listing?.title ?? "Listing"}</span>
                          <span className="ml-2">(not active)</span>
                        </div>

                        <form action={removeWatch}>
                          <input type="hidden" name="listingId" value={w.listing?.id ?? ""} />
                          <button type="submit" className="bd-btn bd-btn-ghost">Remove</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
