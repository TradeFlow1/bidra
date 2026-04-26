import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import ListingCard from "@/components/listing-card";
import ShareActions from "@/components/share-actions";
import { authOptions } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function formatLocation(user: { location?: string | null; suburb?: string | null; state?: string | null }) {
  const explicitLocation = cleanText(user.location);
  if (explicitLocation) return explicitLocation;

  const parts = [cleanText(user.suburb), cleanText(user.state)].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

function formatMemberSince(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

function renderStars(avg: number) {
  const safe = Math.max(0, Math.min(5, avg));
  const full = Math.round(safe);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

async function getSellerProfileData(sellerId: string) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      name: true,
      username: true,
      location: true,
      suburb: true,
      state: true,
      createdAt: true,
      emailVerified: true,
      phone: true,
    },
  });

  if (!seller) return null;

  const [activeListings, completedSales, sellerRating, recentFeedback] = await Promise.all([
    prisma.listing.findMany({
      where: {
        sellerId,
        status: "ACTIVE",
        orders: { none: {} },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
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
        offers: {
          orderBy: { amount: "desc" },
          take: 1,
          select: { amount: true },
        },
        _count: {
          select: { offers: true },
        },
      },
    }),
    prisma.order.count({
      where: {
        listing: { sellerId },
        status: "COMPLETED",
      },
    }),
    prisma.feedback.aggregate({
      where: { toUserId: sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.feedback.findMany({
      where: {
        toUserId: sellerId,
        comment: {
          not: null,
        },
        order: {
          outcome: "COMPLETED",
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    }),
  ]);

  return { seller, activeListings, completedSales, sellerRating, recentFeedback };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getSellerProfileData(params.id);

  if (!data) {
    return {
      title: "Seller not found | Bidra",
      description: "This seller profile is not available.",
    };
  }

  const sellerName = cleanText(data.seller.name) || cleanText(data.seller.username) || "Seller";
  const sellerLocation = formatLocation(data.seller);
  const activeCount = data.activeListings.length;
  const title = `${sellerName} on Bidra`;
  const description = activeCount > 0
    ? `View active listings from ${sellerName} on Bidra.`
    : `View ${sellerName}'s seller profile on Bidra.`;
  const canonicalPath = `/seller/${data.seller.id}`;
  const url = `${getBaseUrl().replace(/\/+$/, "")}${canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "profile",
      url,
      title,
      description: sellerLocation ? `${description} Location: ${sellerLocation}.` : description,
    },
    twitter: {
      card: "summary",
      title,
      description: sellerLocation ? `${description} Location: ${sellerLocation}.` : description,
    },
  };
}

export default async function SellerPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const data = await getSellerProfileData(params.id);

  if (!data) notFound();

  const { seller, activeListings, completedSales, sellerRating, recentFeedback } = data;
  const sellerName = cleanText(seller.name) || cleanText(seller.username) || "Seller";
  const username = cleanText(seller.username);
  const sellerLocation = formatLocation(seller);
  const sellerMemberSince = formatMemberSince(seller.createdAt);
  const sellerPhoneVerified = !!cleanText(seller.phone);
  const ratingAvg = typeof sellerRating._avg.rating === "number" ? Number(sellerRating._avg.rating) : null;
  const ratingCount = Number(sellerRating._count.rating || 0);
  const visibleRecentFeedback = recentFeedback.filter((entry) => cleanText(entry.comment).length > 0);

  const watchedIds = userId
    ? new Set(
        (
          await prisma.watchlist.findMany({
            where: { userId, listingId: { in: activeListings.map((listing) => listing.id) } },
            select: { listingId: true },
          })
        ).map((entry) => entry.listingId),
      )
    : new Set<string>();

  const sellerUrl = `${getBaseUrl().replace(/\/+$/, "")}/seller/${seller.id}`;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Seller profile</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">{sellerName}</h1>
              {username ? <p className="mt-1 text-sm font-medium text-neutral-600">@{username}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-neutral-700">
                {sellerMemberSince ? <span className="rounded-full border border-black/10 bg-white px-3 py-1">Member since {sellerMemberSince}</span> : null}
                {sellerLocation && <span className="rounded-full border border-black/10 bg-white px-3 py-1">{sellerLocation}</span>}
              </div>
              {(seller.emailVerified || sellerPhoneVerified || (ratingAvg !== null && ratingCount > 0)) ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  {seller.emailVerified ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">Email verified</span> : null}
                  {sellerPhoneVerified ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">Phone verified</span> : null}
                  {(ratingAvg !== null && ratingCount > 0) ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">{renderStars(ratingAvg)} ({ratingCount})</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 md:min-w-[320px]">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active listings</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{activeListings.length}</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Completed sales</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{completedSales}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 max-w-md">
            <ShareActions
              url={sellerUrl}
              title={`${sellerName} on Bidra`}
              text={`Check out ${sellerName}'s seller profile on Bidra.`}
              label="Share seller profile"
              description="Share this seller profile."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-950">Active listings</div>
              <div className="mt-1 text-sm text-neutral-600">Browse what this seller currently has available on Bidra.</div>
            </div>

            <Link href="/listings" className="bd-btn bd-btn-ghost text-center">
              Browse marketplace
            </Link>
          </div>

          <div className="mt-5">
            {activeListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 px-6 py-10 text-center">
                <div className="mx-auto max-w-xl">
                  <div className="text-lg font-bold text-neutral-900">No active listings right now</div>
                  <p className="mt-2 text-sm text-neutral-600">This seller has no active listings right now.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {activeListings.map((listing) => {
                  const currentOffer = listing.offers[0]?.amount ?? null;
                  const displayPrice =
                    listing.type === "OFFERABLE"
                      ? currentOffer ?? listing.price
                      : listing.buyNowPrice ?? listing.price;

                  return (
                    <ListingCard
                      key={listing.id}
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        description: listing.description ?? null,
                        price: displayPrice,
                        buyNowPrice: listing.buyNowPrice ?? null,
                        type: listing.type ?? undefined,
                        category: listing.category ?? undefined,
                        condition: listing.condition ?? undefined,
                        location: listing.location ?? undefined,
                        images: listing.images ?? undefined,
                        status: listing.status ?? "ACTIVE",
                        offerCount: listing._count.offers,
                        currentOffer,
                        seller: {
                          name: sellerName,
                          memberSince: seller.createdAt,
                          location: sellerLocation || null,
                          emailVerified: seller.emailVerified,
                          phone: sellerPhoneVerified ? seller.phone : null,
                          ratingAvg,
                          ratingCount,
                        },
                      }}
                      viewerAuthed={!!userId}
                      showWatchButton={!!userId}
                      initiallyWatched={watchedIds.has(listing.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {visibleRecentFeedback.length > 0 ? (
          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-neutral-950">Recent feedback</div>
            <div className="mt-1 text-sm text-neutral-600">Latest completed-order feedback from recent transactions.</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {visibleRecentFeedback.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-xs font-semibold text-amber-700">{renderStars(entry.rating)}</div>
                  <p className="mt-2 text-sm text-neutral-700">{cleanText(entry.comment) || ""}</p>
                  <div className="mt-2 text-xs text-neutral-500">
                    <time dateTime={entry.createdAt.toISOString()}>
                      {entry.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
