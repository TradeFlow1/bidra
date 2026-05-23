import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import ListingCard from "@/components/listing-card";
import ShareActions from "@/components/share-actions";
import { authOptions } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

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
  const rounded = Math.round(safe * 10) / 10;
  return rounded.toFixed(1) + "/5";
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
        order: { outcome: "COMPLETED" },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
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
  const title = sellerName + " on Bidra";
  const description = activeCount > 0
    ? "View active listings from " + sellerName + " on Bidra."
    : "View " + sellerName + "'s seller profile on Bidra.";
  const canonicalPath = "/seller/" + data.seller.id;
  const url = getBaseUrl().replace(/\/+$/, "") + canonicalPath;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "profile",
      url,
      title,
      description: sellerLocation ? description + " Location: " + sellerLocation + "." : description,
    },
    twitter: {
      card: "summary",
      title,
      description: sellerLocation ? description + " Location: " + sellerLocation + "." : description,
    },
  };
}

const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

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

  const ratingSignal = ratingAvg !== null && ratingCount > 0
    ? renderStars(ratingAvg) + " from " + ratingCount + " " + (ratingCount === 1 ? "review" : "reviews")
    : "";

  const profileSignals = [
    seller.emailVerified ? "Email confirmed" : "",
    sellerPhoneVerified ? "Phone confirmed" : "",
    sellerMemberSince ? "Member since " + sellerMemberSince : "",
    sellerLocation ? sellerLocation : "",
  ].filter(Boolean);

  const visibleRecentFeedback = recentFeedback;

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

  const sellerUrl = getBaseUrl().replace(/\/+$/, "") + "/seller/" + seller.id;

  return (
    <ReferencePage>
      <div className={appNarrowShell + " space-y-5 py-5 sm:py-8"}>
        <BackButton href="/listings" label="Back to listings" />
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Seller profile</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{sellerName}</h1>
              {username ? <p className="mt-1 text-sm font-semibold text-[#64748B]">@{username}</p> : null}

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {profileSignals.length > 0 ? profileSignals.map((signal) => (
                  <span key={signal} className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1.5 text-[#4F46E5] hover:bg-[#F5F3FF]">{signal}</span>
                )) : (
                  <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1.5 text-[#4F46E5] hover:bg-[#F5F3FF]">Profile details limited</span>
                )}

                {ratingSignal ? (
                  <Link
                    href="#seller-feedback"
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800 underline-offset-2 hover:underline"
                  >
                    {ratingSignal}
                  </Link>
                ) : null}
              </div>

              <div className="mt-4 max-w-md">
                <ShareActions
                  url={sellerUrl}
                  title={sellerName + " on Bidra"}
                  text={"Check out " + sellerName + "'s seller profile on Bidra."}
                  label="Share seller profile"
                  description="Share this seller profile."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm hover:bg-[#F5F3FF]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Active listings</div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#0F172A]">{activeListings.length}</div>
              </div>
              <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm hover:bg-[#F5F3FF]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Sales</div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#0F172A]">{completedSales}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 hover:bg-[#F5F3FF]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#0F172A]">Active listings</div>
              <div className="mt-1 text-sm text-[#64748B]">{activeListings.length} active {activeListings.length === 1 ? "listing" : "listings"}</div>
            </div>

            <Link href="/listings" className={actionClass}>
              Browse marketplace
            </Link>
          </div>

          <div className="mt-5">
            {activeListings.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D8E1F0] bg-[#F8FAFC] px-6 py-10 text-center">
                <div className="text-lg font-extrabold text-[#0F172A]">No active listings</div>
                <p className="mt-2 text-sm text-[#64748B]">This seller has no active listings right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
          <section id="seller-feedback" className="scroll-mt-24 rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 hover:bg-[#F5F3FF]">
            <div className="text-xl font-extrabold tracking-tight text-[#0F172A]">Seller feedback</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {visibleRecentFeedback.map((entry) => (
                <article key={entry.id} className="rounded-[24px] border border-[#D8E1F0] bg-[#F8FAFC] p-4">
                  <div className="text-xs font-extrabold text-amber-700">{renderStars(entry.rating)}</div>
                  <p className="mt-2 text-sm leading-6 text-[#475569]">{cleanText(entry.comment) || "No written comment."}</p>
                  <div className="mt-2 text-xs text-[#64748B]">
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
    </ReferencePage>
  );
}
