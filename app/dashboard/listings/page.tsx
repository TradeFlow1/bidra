import { labelCategory } from "@/lib/labels";
import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { isTimedOffersType } from "@/lib/listing-type";
import DeleteListingButton from "@/components/delete-listing-button";

type PageProps = {
  searchParams?: { err?: string; ok?: string };
};

function safeErr(s: unknown): string {
  const v = String(s ?? "").slice(0, 180);
  return encodeURIComponent(v);
}

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(value / 100).toFixed(2)} AUD`;
}

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (status === "ENDED") return "bg-amber-50 border-amber-200 text-amber-900";
  if (status === "DRAFT") return "bg-[#F1F8FA] border-[#D7E2F1] text-[#334155]";
  return "bg-[#F1F8FA] border-[#D7E2F1] text-[#334155]";
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : "";
  if (!userId) redirect("/auth/login");

  const err = searchParams?.err ? decodeURIComponent(String(searchParams.err)) : "";
  const ok = cleanOk(searchParams?.ok);
  const okMessage = String(searchParams?.ok || "") === "deleted" ? "Listing deleted successfully." : "Your listing status was updated successfully.";

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  async function endListing(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const uid = s?.user?.id ? String(s.user.id) : "";
    if (!uid) redirect("/auth/login");

    const safe = (m: string) => encodeURIComponent(String(m || "").slice(0, 180));
    const id = String(formData.get("id") ?? "").trim();

    if (!id) redirect("/dashboard/listings?err=" + safe("Missing listing id"));

    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { id: true, sellerId: true, status: true },
      });

      if (!listing) {
        redirect("/dashboard/listings?err=" + safe("Listing not found"));
        return;
      }

      if (listing.sellerId !== uid) {
        redirect("/dashboard/listings?err=" + safe("Not allowed"));
        return;
      }

      const currentStatus = String(listing.status || "").toUpperCase();

      if (currentStatus === "SOLD") {
        redirect("/dashboard/listings?err=" + safe("Sold listings cannot be changed"));
        return;
      }

      if (currentStatus !== "ACTIVE") {
        redirect("/dashboard/listings?err=" + safe("Only active listings can be ended from here"));
        return;
      }

      await prisma.listing.update({
        where: { id },
        data: { status: "ENDED" },
      });

      redirect("/dashboard/listings?ok=1");
    } catch (e: any) {
      console.error("dashboard/listings endListing failed:", e);
      redirect("/dashboard/listings?err=" + safe("Could not end listing"));
    }
  }

  const activeCount = listings.filter((l: any) => String(l.status) === "ACTIVE").length;
  const endedCount = listings.filter((l: any) => String(l.status) === "ENDED").length;
  const draftCount = listings.filter((l: any) => String(l.status) === "DRAFT").length;

  return (
    <main className="bd-container py-4 sm:py-8">
      <div className="container max-w-7xl">
        <div className="flex flex-col gap-3 sm:gap-4">
          <AccountNav active="selling" />
          <div className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">My Bidra</div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">My listings</h1>
                <p className="mt-2 max-w-2xl text-sm bd-ink2 sm:text-base">
                  Manage active listings, drafts, ended listings, and offer visibility in one place.
                </p>
              </div>

              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <Link href="/sell/new" className="bd-btn bd-btn-secondary text-center">
                  Create new listing
                </Link>
                <Link href="/listings" className="bd-btn bd-btn-secondary text-center">
                  Browse marketplace
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-[22px] border border-[#D8E1F0] bg-white p-3 shadow-sm sm:p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Active</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#07152E] sm:text-3xl">{activeCount}</div>
              <div className="mt-1 text-xs text-[#526173] sm:text-sm">Visible to buyers.</div>
            </div>

            <div className="rounded-[22px] border border-[#D8E1F0] bg-white p-3 shadow-sm sm:p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Ended</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#07152E] sm:text-3xl">{endedCount}</div>
              <div className="mt-1 text-xs text-[#526173] sm:text-sm">Review or relist.</div>
            </div>

            <div className="rounded-[22px] border border-[#D8E1F0] bg-white p-3 shadow-sm sm:p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Drafts</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#07152E] sm:text-3xl">{draftCount}</div>
              <div className="mt-1 text-xs text-[#526173] sm:text-sm">Saved drafts.</div>
            </div>
          </div>

          {ok ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-sm font-extrabold text-emerald-900">Listing updated</div>
              <div className="mt-1 text-sm text-emerald-800">{okMessage}</div>
            </div>
          ) : null}

          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="text-sm font-extrabold text-red-900">Couldn't update</div>
              <div className="mt-1 text-sm text-red-800">{err}</div>
            </div>
          ) : null}

          {!listings.length ? (
            <div className="rounded-[28px] border border-dashed border-[#C8D7EA] bg-[#F8FAFF] px-6 py-12 text-center">
              <div className="mx-auto w-full max-w-xl">
                <div className="text-xl font-extrabold text-[#0F172A]">List your first real item</div>
                <p className="mt-2 text-sm text-[#526173]">
                  Start with one genuine item. Add real photos, accurate condition, price, location, and pickup or postage notes so buyers can act with confidence.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/sell/new" className="bd-btn bd-btn-secondary text-center">
                    Create your first listing
                  </Link>
                  <Link href="/how-it-works" className="bd-btn bd-btn-secondary text-center">
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {listings.map((l: any) => {
                const listingTypeLabel = isTimedOffersType(l.type) ? "Timed offers" : "Buy Now";
                const priceLabel = formatMoney(l.price);
                const locationLabel = String(l.location || "Location not set");
                const categoryLabel = labelCategory(l.category);
                const statusLabel = String(l.status || "UNKNOWN");

                return (
                  <Card
                    key={l.id}
                    className="overflow-hidden rounded-[24px] border border-[#D8E1F0] bg-white p-3 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{listingTypeLabel}</Badge>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(statusLabel)}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <Link
                          className="mt-2 block max-w-full truncate text-base font-extrabold text-[#07152E] hover:underline underline-offset-4 sm:text-xl"
                          href={"/listings/" + l.id}
                        >
                          {l.title}
                        </Link>

                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#526173] sm:text-sm">
                          <div>{categoryLabel}</div>
                          <div>{locationLabel}</div>
                        </div>

                        <div className="mt-2 grid grid-cols-[0.75fr_1.25fr] gap-2 sm:flex sm:flex-wrap sm:items-end sm:gap-6">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Price</div>
                            <div className="mt-1 text-lg font-extrabold text-[#07152E]">{priceLabel}</div>
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">ID</div>
                            <div className="mt-1 max-w-full truncate text-[11px] font-semibold text-[#334155] sm:text-sm">{l.id}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col gap-2 border-t border-[#D8E1F0] pt-2 lg:mt-0 lg:w-[260px] lg:border-t-0 lg:pt-0">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                          <Link href={"/listings/" + l.id} className="bd-btn bd-btn-secondary text-center">
                            View listing
                          </Link>
                          <Link href={"/sell/edit/" + l.id} className="bd-btn bd-btn-secondary text-center">
                            Edit listing
                          </Link>
                        </div>

                        {statusLabel === "SOLD" ? null : statusLabel === "ACTIVE" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <DeleteListingButton listingId={String(l.id)} listingTitle={String(l.title || "this listing")} />
                            <form action={endListing}>
                              <input type="hidden" name="id" value={l.id} />
                              <button type="submit" className="w-full rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]">
                                End
                              </button>
                            </form>
                          </div>
                        ) : (
                          <DeleteListingButton listingId={String(l.id)} listingTitle={String(l.title || "this listing")} />
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function cleanOk(v: unknown) {
  const s = String(v ?? "").trim();
  return s === "1";
}

