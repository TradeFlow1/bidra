import { labelCategory } from "@/lib/labels";
import Link from "next/link";
import { auth } from "@/lib/auth";
import type { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { isTimedOffersType } from "@/lib/listing-type";

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
  if (status === "DRAFT") return "bg-neutral-100 border-black/10 text-neutral-800";
  return "bg-neutral-100 border-black/10 text-neutral-800";
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : "";
  if (!userId) redirect("/auth/login");

  const err = searchParams?.err ? decodeURIComponent(String(searchParams.err)) : "";
  const ok = cleanOk(searchParams?.ok);

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const uid = s?.user?.id ? String(s.user.id) : "";
    if (!uid) redirect("/auth/login");

    const safe = (m: string) => encodeURIComponent(String(m || "").slice(0, 180));

    const id = String(formData.get("id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();

    if (!id) redirect("/dashboard/listings?err=" + safe("Missing listing id"));
    if (!status) redirect("/dashboard/listings?err=" + safe("Missing status"));

    const SELLER_ALLOWED = ["DRAFT", "ACTIVE", "ENDED"];

    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { id: true, sellerId: true },
      });

      if (!listing) { redirect("/dashboard/listings?err=" + safe("Listing not found")); return; }
      if (listing.sellerId !== uid) { redirect("/dashboard/listings?err=" + safe("Not allowed")); return; }

      if (!SELLER_ALLOWED.includes(status)) { redirect("/dashboard/listings?err=" + safe("Invalid status")); return; }

      const statusUpper = String(status || "").toUpperCase();
      const allowed: Record<string, boolean> = { DRAFT: true, ACTIVE: true, ENDED: true };
      if (!allowed[statusUpper]) {
        throw new Error("Invalid status");
      }
      const nextStatus: ListingStatus = statusUpper as ListingStatus;

      await prisma.listing.update({
        where: { id },
        data: { status: nextStatus },
      });

      redirect("/dashboard/listings?ok=1");
    } catch (e: any) {
      console.error("dashboard/listings updateStatus failed:", e);
      redirect("/dashboard/listings?err=" + safe("Couldn't update"));
    }
  }

  const activeCount = listings.filter((l: any) => String(l.status) === "ACTIVE").length;
  const endedCount = listings.filter((l: any) => String(l.status) === "ENDED").length;
  const draftCount = listings.filter((l: any) => String(l.status) === "DRAFT").length;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl">
        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Seller dashboard</div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">My listings</h1>
                <p className="mt-2 max-w-2xl text-sm bd-ink2 sm:text-base">
                  Seller mode is active here. Manage active listings, drafts, ended listings, and offer visibility in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/sell/new" className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                  Create new listing
                </Link>
                <Link href="/listings" className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                  Browse marketplace
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{activeCount}</div>
              <div className="mt-1 text-sm text-neutral-600">Listings currently visible to buyers.</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Ended</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{endedCount}</div>
              <div className="mt-1 text-sm text-neutral-600">Listings that can be reviewed, updated, or relisted.</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Drafts</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{draftCount}</div>
              <div className="mt-1 text-sm text-neutral-600">Listings saved before going live in the marketplace.</div>
            </div>
          </div>

          {ok ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-sm font-extrabold text-emerald-900">Listing updated</div>
              <div className="mt-1 text-sm text-emerald-800">Your listing status was updated successfully.</div>
            </div>
          ) : null}

          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="text-sm font-extrabold text-red-900">Couldn't update</div>
              <div className="mt-1 text-sm text-red-800">{err}</div>
            </div>
          ) : null}

          {!listings.length ? (
            <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center">
              <div className="mx-auto max-w-xl">
                <div className="text-xl font-extrabold text-neutral-900">No listings yet</div>
                <p className="mt-2 text-sm text-neutral-600">
                  Start with your first listing, add clear details, and keep handover expectations in Messages.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/sell/new" className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                    Create listing
                  </Link>
                  <Link href="/how-it-works" className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {listings.map((l: any) => {
                const listingTypeLabel = isTimedOffersType(l.type) ? "Timed offers" : "Buy Now";
                const priceLabel = formatMoney(l.price);
                const locationLabel = String(l.location || "Location not set");
                const categoryLabel = labelCategory(l.category);
                const statusLabel = String(l.status || "UNKNOWN");

                return (
                  <Card
                    key={l.id}
                    className="overflow-hidden rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{listingTypeLabel}</Badge>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(statusLabel)}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <Link
                          className="mt-3 block max-w-full truncate text-xl font-extrabold text-neutral-950 hover:underline underline-offset-4"
                          href={"/listings/" + l.id}
                        >
                          {l.title}
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600">
                          <div>{categoryLabel}</div>
                          <div>{locationLabel}</div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-end gap-6">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Price</div>
                            <div className="mt-1 text-lg font-extrabold text-neutral-950">{priceLabel}</div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listing ID</div>
                            <div className="mt-1 text-sm font-medium text-neutral-700">{l.id}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:w-[260px]">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                          <Link href={"/listings/" + l.id} className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                            View listing
                          </Link>
                          <Link href={"/sell/edit/" + l.id} className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                            Edit listing
                          </Link>
                        </div>

                        <form action={updateStatus} className="rounded-2xl border border-black/10 bg-neutral-50 p-3">
                          <input type="hidden" name="id" value={l.id} />
                          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listing status</div>
                          <div className="mt-2 flex gap-2">
                            <select name="status" defaultValue={String(l.status)} className="bd-input flex-1">
                              <option value="DRAFT">Draft</option>
                              <option value="ACTIVE">Active</option>
                              <option value="ENDED">Ended</option>
                            </select>
                            <button type="submit" className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black disabled:opacity-80">
                              Update
                            </button>
                          </div>
                        </form>
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
