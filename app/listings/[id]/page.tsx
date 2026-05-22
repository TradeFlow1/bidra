import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";
import ListingCard from "@/components/listing-card";
import { getRecommendationFoundationSummary, getRelatedListingWhere } from "@/lib/recommendations";
import ListingImageGallery from "@/components/listing-image-gallery";
import ShareActions from "@/components/share-actions";
import BuyNowButton from "./buy-now-button";
import PlaceOfferClient from "./place-offer-client";
import AcceptHighestOfferButton from "./accept-highest-offer-button";
import DeclineHighestOfferButton from "./decline-highest-offer-button";
import WatchlistButton from "./watchlist-button";
import MessageSellerButton from "./message-seller-button";
import ReportListingButton from "./report-listing-button";
import DeleteListingButton from "./delete-listing-button";
import RelistButton from "./relist-button";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const revalidate = 10;

function money(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;


  return (v / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMemberSince(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

function getBaseUrl() {
  return (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function getDescriptionExcerpt(value: string | null | undefined) {
  const cleaned = cleanText(value)
    .replace(/Selling:\s*/gi, "")
    .replace(/Condition:\s*/gi, "")
    .replace(/Details:\s*/gi, "")
    .trim();
  if (!cleaned) return "";
  return cleaned.length > 180 ? cleaned.slice(0, 177).trimEnd() + "..." : cleaned;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      location: true,
      images: true,
    },
  });

  if (!listing) {
    return {
      title: "Listing not found | Bidra",
      description: "This listing is no longer available.",
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/listings/${listing.id}`;
  const firstImage = Array.isArray(listing.images) ? cleanText(String(listing.images[0] || "")) : "";
  const absoluteImage = firstImage
    ? (firstImage.startsWith("http://") || firstImage.startsWith("https://")
        ? firstImage
        : `${baseUrl}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`)
    : "";
  const priceText = money(listing.price);
  const locationText = cleanText(listing.location) || "Location on request";
  const excerpt = getDescriptionExcerpt(listing.description);
  const listingTitle = cleanText(listing.title) || "Bidra listing";
  const metaDescription = excerpt || `${priceText} • ${locationText}`;
  const title = `${listingTitle} | ${priceText} • ${locationText} | Bidra`;

  return {
    title,
    description: metaDescription,
    alternates: { canonical: `/listings/${listing.id}` },
    openGraph: {
      type: "website",
      url,
      title: `${listingTitle} • ${priceText}`,
      description: `${locationText}${excerpt ? ` • ${excerpt}` : ""}`,
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
    },
    twitter: {
      card: absoluteImage ? "summary_large_image" : "summary",
      title: `${listingTitle} • ${priceText}`,
      description: `${locationText}${excerpt ? ` • ${excerpt}` : ""}`,
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          createdAt: true,
          location: true,
          emailVerified: true,
          phone: true,
        },
      },
      offers: {
        orderBy: { amount: "desc" },
        include: { buyer: true },
      },
      orders: true,
    },
  });

  if (!listing) notFound();

  const [sellerActiveListings, sellerRating] = await Promise.all([
    prisma.listing.count({
      where: { sellerId: listing.sellerId, status: "ACTIVE", orders: { none: {} } },
    }),
    prisma.feedback.aggregate({
      where: { toUserId: listing.sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const isOwner = !!userId && listing.sellerId === userId;
  const isTimedOffers = isTimedOffersType(listing.type);
  const currentOffer = listing.offers.length ? listing.offers[0].amount : null;
  const displayPrice = isTimedOffers ? (currentOffer ?? listing.price) : (listing.buyNowPrice ?? listing.price);
  const isSold = listing.orders.length > 0 || listing.status !== "ACTIVE";
  const endsText = isTimedOffers ? formatTimeRemaining((listing as any).endsAt) : null;
  const topOffer = listing.offers.length ? listing.offers[0] : null;
  const offerCount = listing.offers.length;
  const offerWindowText = endsText && endsText !== "Ended" ? "Offer window ends in " + endsText : "Offer window has ended";

  const sellerName = cleanText((listing.seller as any)?.name || (listing.seller as any)?.username || "Bidra seller");
  const sellerLocation = cleanText((listing.seller as any)?.location || listing.location || "Australia");
  const sellerMemberSince = formatMemberSince((listing.seller as any)?.createdAt);
  const sellerEmailVerified = !!(listing.seller as any)?.emailVerified;
  const sellerPhoneVerified = !!cleanText((listing.seller as any)?.phone);
  const sellerRatingAvg = typeof sellerRating?._avg?.rating === "number" ? Number(sellerRating._avg.rating) : null;
  const sellerRatingCount = Number(sellerRating?._count?.rating || 0);
  const sellerTrustSignals = [
    sellerEmailVerified ? "Email confirmed" : "",
    sellerPhoneVerified ? "Phone confirmed" : "",
    sellerMemberSince ? "Member since " + sellerMemberSince : "",
    sellerRatingAvg !== null && sellerRatingCount > 0 ? "Rated by completed orders" : "",
  ].filter(Boolean);
  const listedDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const images = (listing as any).images || [];
  const baseUrl = getBaseUrl();
  const listingUrl = `${baseUrl}/listings/${listing.id}`;

  const recommendationSummary = getRecommendationFoundationSummary();
  const relatedListings = await prisma.listing.findMany({
    where: getRelatedListingWhere({
      currentListingId: listing.id,
      category: listing.category,
      location: listing.location,
      sellerId: listing.sellerId,
    }),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 4,
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
      createdAt: true,
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

  return (
    <ReferencePage>
      <div className={appNarrowShell + " flex flex-col gap-4 overflow-hidden py-4 lg:overflow-visible lg:py-6"}>
        <BackButton href="/listings" label="Back to listings" />

        {/* BIDRA_MOBILE_LISTING_DETAIL_FINAL */}
        <section className="min-w-0 space-y-3 lg:hidden">
          <div className="overflow-hidden rounded-[30px] border border-[#D8E6F8] bg-white shadow-[0_18px_50px_rgba(32,75,140,0.10)]">
            <div className="p-2.5">
              <ListingImageGallery images={images} title={cleanText(listing.title)} />
            </div>
          </div>
          <div className="rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#475569]">{cleanText(listing.category) || "Listing"}</span>
              <span
                className={
                  isTimedOffers
                    ? "rounded-full border border-amber-200 bg-[#FFFBEB] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800"
                    : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800"
                }
              >
                {isTimedOffers ? "Offers" : "Buy now"}
              </span>
              {isSold ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">Sold</span>
              ) : null}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#0F172A]">{cleanText(listing.title)}</h1>
            <div className="mt-2 text-sm font-semibold text-[#64748B]">{cleanText(listing.location) || "Location on request"}</div>

            <div className="mt-4 rounded-[24px] border border-[#D8E1F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Highest offer" : "Price"}</div>
              <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#0F172A]">{money(displayPrice)}</div>

              {isTimedOffers ? (
                <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#475569]">
                  <div>{currentOffer !== null ? "Current highest offer: " + money(currentOffer) : "No offers yet."}</div>
                  <div>{offerCount} {offerCount === 1 ? "offer" : "offers"}</div>
                  <div>{offerWindowText}</div>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-blue-100 bg-[#EEF4FF] px-3 py-2 text-xs font-bold leading-5 text-[#0B3BB8]">{isTimedOffers ? "Make an offer and the seller can respond before handover is arranged." : "Buy now for the listed price, then confirm handover details with the seller."}</div>

              <div className="mt-4 space-y-3">
                {isSold ? (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
                    <div className="font-semibold">Sold item.</div>
                    <Link href="/listings" className="bd-mobile-tap-target mt-2 inline-flex items-center text-sm font-semibold text-[#0F172A] underline underline-offset-2">Browse listings</Link>
                  </div>
                ) : isTimedOffers ? (
                  <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                ) : (
                  <BuyNowButton listingId={listing.id} />
                )}

                {isOwner ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm font-semibold leading-6 text-amber-950">
                    This is your listing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    <WatchlistButton listingId={listing.id} authed={!!userId} loginHref="/auth/login" />
                    <MessageSellerButton listingId={listing.id} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Description</div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0F172A]">About this item</h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[#1E293B]">{listing.description?.replace(/Selling:\s*/gi, "").replace(/Condition:\s*/gi, "").replace(/Details:\s*/gi, "").trim() || "No description provided. Message the seller before buying or making an offer."}</p>
          </section>

          <section className="rounded-[24px] border border-[#D8E1F0] bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Seller</div>
                <div className="mt-1 truncate text-lg font-extrabold tracking-tight text-[#0F172A]">{sellerName}</div>
                <div className="mt-1 text-sm font-semibold text-[#64748B]">{sellerLocation} - {sellerActiveListings} active</div>
              </div>
              <Link href={"/seller/" + listing.sellerId} className="bd-mobile-tap-target shrink-0 rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-2 text-xs font-extrabold text-[#0F172A] shadow-sm transition hover:bg-white">Profile</Link>
            </div>

            {sellerTrustSignals.length > 0 ? (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
                {sellerTrustSignals.map((signal) => (
                  <span key={signal} className="shrink-0 rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-2 py-1 text-[#334155]">{signal}</span>
                ))}
              </div>
            ) : null}
          </section>

          <details className="group rounded-[24px] border border-[#D8E1F0] bg-white p-3 text-sm text-[#475569] shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-[#0F172A] [&::-webkit-details-marker]:hidden">
              <span>Details and safety</span>
              <span className="text-xs font-bold text-[#64748B] group-open:hidden">Open</span>
              <span className="hidden text-xs font-bold text-[#64748B] group-open:inline">Close</span>
            </summary>

            <div className="mt-3 space-y-3 border-t border-[#E2E8F0] pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#F8FAFC] p-2">
                  <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Sale type</div>
                  <div className="mt-1 font-bold text-[#0F172A]">{isTimedOffers ? "Offers" : "Buy now"}</div>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-2">
                  <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Condition</div>
                  <div className="mt-1 font-bold text-[#0F172A]">{cleanText(listing.condition)}</div>
                </div>
              </div>

              <div>
                <div className="font-extrabold text-[#0F172A]">Before you act</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
                  <li>Check photos, description, condition, location, and seller profile.</li>
                  <li>Keep pickup, postage, payment, and handover details in Messages.</li>
                  <li>Report anything suspicious before committing.</li>
                </ul>
              </div>

              <ShareActions
                url={listingUrl}
                title={cleanText(listing.title)}
                text={`Take a look at this listing on Bidra: ${cleanText(listing.title)}`}
                label="Share listing"
              />

              <div className="border-t border-[#E2E8F0] pt-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">Report listing</div>
                <ReportListingButton listingId={listing.id} />
              </div>
            </div>
          </details>
        </section>

        <section className="hidden min-w-0 overflow-hidden rounded-[34px] border border-[#D8E6F8] bg-white p-4 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-5 xl:p-6 lg:block">
          <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{cleanText(listing.category) || "Listing"}</span>
                  <span
                    className={
                      isTimedOffers
                        ? "rounded-full border border-amber-200 bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800"
                        : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800"
                    }
                  >
                    {isTimedOffers ? "Offers" : "Buy now"}
                  </span>
                  {listing.condition ? (
                    <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{cleanText(listing.condition)}</span>
                  ) : null}
                  <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{cleanText(listing.location) || "Location on request"}</span>
                  {isSold ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">Sold</span>
                  ) : null}
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{cleanText(listing.title)}</h1>

                <div className="mt-2 text-sm text-[#64748B]">
                  <span>{cleanText(listing.location) || "Location on request"}</span>
                </div>
              </div>

              {/* BIDRA_MOBILE_ACTION_START */}
              <div className="rounded-[26px] border border-[#D8E1F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-4 shadow-sm lg:hidden">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Highest offer" : "Price"}</div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#0F172A]">{money(displayPrice)}</div>

                {isTimedOffers ? (
                  <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#475569]">
                    <div>{currentOffer !== null ? "Current highest offer: " + money(currentOffer) : "No offers yet."}</div>
                    <div>{offerCount} {offerCount === 1 ? "offer" : "offers"}</div>
                    <div>{offerWindowText}</div>
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  {isSold ? (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
                      <div className="font-semibold">Sold item.</div>
                      <Link href="/listings" className="bd-mobile-tap-target mt-2 inline-flex items-center text-sm font-semibold text-[#0F172A] underline underline-offset-2">Browse listings</Link>
                    </div>
                  ) : isTimedOffers ? (
                    <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                  ) : (
                    <BuyNowButton listingId={listing.id} />
                  )}

                  {isOwner ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm font-semibold leading-6 text-amber-950">
                      This is your listing.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      <WatchlistButton listingId={listing.id} authed={!!userId} loginHref="/auth/login" />
                      <MessageSellerButton listingId={listing.id} />
                    </div>
                  )}
                </div>
              </div>
              {/* BIDRA_MOBILE_ACTION_END */}


              <div className="min-w-0 overflow-hidden rounded-[26px] border border-[#D8E1F0] bg-white shadow-sm">
                <div className="p-2.5 sm:p-3">
                  <ListingImageGallery images={images} title={cleanText(listing.title)} />
                </div>
              </div>

              {/* BIDRA_MOBILE_INFO_START */}
              <div className="space-y-3 lg:hidden">
                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 shadow-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Description</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#1E293B]">{listing.description?.replace(/Selling:\s*/gi, "").replace(/Condition:\s*/gi, "").replace(/Details:\s*/gi, "").trim() || "No description provided. Message the seller before buying or making an offer."}</p>
                </div>

                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 shadow-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Seller</div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">{sellerName}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-[#F8FAFC] p-2">
                      <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Location</div>
                      <div className="mt-1 font-bold text-[#0F172A]">{sellerLocation}</div>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2">
                      <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Listings</div>
                      <div className="mt-1 font-bold text-[#0F172A]">{sellerActiveListings} active</div>
                    </div>
                  </div>

                  <Link href={"/seller/" + listing.sellerId} className="bd-mobile-tap-target mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]">View seller profile</Link>
                </div>

                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 text-sm text-[#475569] shadow-sm">
                  <div className="font-extrabold text-[#0F172A]">Before you act</div>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-6">
                    <li>Check the photos, description, condition, location, and seller profile.</li>
                    <li>Keep payment, pickup, postage, and handover details in Messages.</li>
                    <li>Report anything suspicious before committing.</li>
                  </ul>
                </div>
              </div>
              {/* BIDRA_MOBILE_INFO_END */}


              {/* BIDRA_MOVED_ITEM_DETAILS_START */}
              <div className="hidden space-y-3 lg:block">
            <section className="overflow-hidden rounded-[26px] border border-[#D8E1F0] bg-white shadow-sm" aria-labelledby="listing-description-heading">
              <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Item description</div>
                <h2 id="listing-description-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#0F172A] sm:text-2xl">About this item</h2>
                
              </div>

              <div className="p-4 sm:p-5">
                <div className="rounded-[24px] bg-white p-0">
                  <p className="whitespace-pre-wrap text-base leading-7 text-[#1E293B] sm:text-[17px] sm:leading-8">{listing.description?.replace(/Selling:\s*/gi, "").replace(/Condition:\s*/gi, "").replace(/Details:\s*/gi, "").trim() || "No description provided. Message the seller before buying or making an offer."}</p>
                </div>

                <div className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Item details</div>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Sale type</div>
                    <div className="mt-1.5 text-sm font-extrabold text-[#0F172A]">{isTimedOffers ? "Offers" : "Buy now"}</div>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Condition</div>
                    <div className="mt-1.5 text-sm font-extrabold text-[#0F172A]">{cleanText(listing.condition)}</div>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Category</div>
                    <div className="mt-1.5 text-sm font-extrabold text-[#0F172A]">{cleanText(listing.category)}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm leading-6 text-[#334155]">
                  <div><span className="font-extrabold text-[#0F172A]">Location:</span> {cleanText(listing.location)}</div>
                  <div><span className="font-extrabold text-[#0F172A]">Listed:</span> {new Date(listing.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</div>
                  {isSold ? <div><span className="font-extrabold text-[#0F172A]">Status:</span> Sold</div> : null}
                </div>
              </div>
            </section>
          </div>
              {/* BIDRA_MOVED_ITEM_DETAILS_END */}
            </div>

            <div className="hidden w-full min-w-0 overflow-hidden rounded-[26px] border border-[#D8E1F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-4 shadow-sm lg:sticky lg:top-24 lg:block">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Highest offer" : "Price"}</div>
              <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#0F172A]">{money(displayPrice)}</div>

              {isTimedOffers ? (
                <div className="mt-2 rounded-2xl border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#475569]">
                  <div>{currentOffer !== null ? "Current highest offer: " + money(currentOffer) : "No offers yet."}</div>
                  <div>{offerCount} {offerCount === 1 ? "offer" : "offers"}</div>
                  <div>{offerWindowText}</div>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {isSold ? (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
                    <div className="font-semibold">Sold item.</div>
                    <div className="mt-1">This listing is no longer available. Buyer and seller should keep payment, pickup, postage, and handover details in Bidra Messages.</div>
                    <Link href="/listings" className="bd-mobile-tap-target mt-2 inline-flex items-center text-sm font-semibold text-[#0F172A] underline underline-offset-2">Browse listings</Link>
                  </div>
                ) : isTimedOffers ? (
                  <div className="space-y-2">
                    
                    <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    
                    <BuyNowButton listingId={listing.id} />
                  </div>
                )}

                {isOwner ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm font-semibold leading-6 text-amber-950">
                    This is your listing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <WatchlistButton listingId={listing.id} authed={!!userId} loginHref="/auth/login" />
                    <MessageSellerButton listingId={listing.id} />
                  </div>
                )}

                                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 shadow-sm lg:hidden">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Description</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#1E293B]">{listing.description?.replace(/Selling:\s*/gi, "").replace(/Condition:\s*/gi, "").replace(/Details:\s*/gi, "").trim() || "No description provided. Message the seller before buying or making an offer."}</p>
                </div>

                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 shadow-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Seller</div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">{sellerName}</div>

                  <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-[#F8FAFC] p-2">
                      <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Location</div>
                      <div className="mt-1 font-bold text-[#0F172A]">{sellerLocation}</div>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2">
                      <div className="font-bold uppercase tracking-[0.12em] text-[#64748B]">Listings</div>
                      <div className="mt-1 font-bold text-[#0F172A]">{sellerActiveListings} active</div>
                    </div>
                  </div>

                  {sellerTrustSignals.length > 0 ? (
                    <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-xs font-semibold">
                      {sellerTrustSignals.map((signal) => (
                        <span key={signal} className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-2.5 py-1 text-[#334155]">{signal}</span>
                      ))}
                    </div>
                  ) : null}

                  <Link href={"/seller/" + listing.sellerId} className="bd-mobile-tap-target mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]">View seller profile</Link>
                </div>

                <ShareActions
                  url={listingUrl}
                  title={cleanText(listing.title)}
                  text={`Take a look at this listing on Bidra: ${cleanText(listing.title)}`}
                  label="Share listing"
                />
                                <div className="rounded-2xl border border-[#D8E1F0] bg-white px-3.5 py-3 text-sm text-[#475569] shadow-sm">
                  <div className="font-extrabold text-[#0F172A]">Before you act</div>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-6">
                    <li>Check the photos, description, condition, location, and seller profile.</li>
                    <li>Keep payment, pickup, postage, and handover details in Messages.</li>
                    <li>Report anything suspicious before committing.</li>
                  </ul>
                </div>
              </div>

              {isOwner && isTimedOffers && !isSold && topOffer ? (
                <div className="mt-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-3.5">
                  <div className="mt-1 text-sm font-semibold text-[#92400E]">Accepting the highest offer creates a pending order record, marks the listing as sold, and opens order details for next steps.</div>
                  <div className="mt-2 space-y-2">
                    <AcceptHighestOfferButton listingId={listing.id} />
                    <DeclineHighestOfferButton listingId={listing.id} />
                  </div>
                </div>
              ) : null}

              {isOwner ? (
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <DeleteListingButton id={listing.id} />
                  <RelistButton listingId={listing.id} />
                </div>
              ) : null}

              <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">Report listing</div>
                <ReportListingButton listingId={listing.id} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5 xl:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">More listings</div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">Similar listings</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#475569]">{recommendationSummary.summary}</p>
            </div>
            <Link href="/listings" className="bd-mobile-tap-target inline-flex items-center justify-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View all listings</Link>
          </div>
          {relatedListings.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedListings.map(function (related) {
                const relatedIsTimedOffers = isTimedOffersType(related.type);
                const relatedCurrentOffer = related.offers.length ? related.offers[0].amount : null;
                const relatedDisplayPrice = relatedIsTimedOffers ? (relatedCurrentOffer ?? related.price) : (related.buyNowPrice ?? related.price);
                return (
                  <ListingCard
                    key={related.id}
                    listing={{
                      id: related.id,
                      title: related.title,
                      description: related.description,
                      price: relatedDisplayPrice,
                      buyNowPrice: related.buyNowPrice,
                      type: related.type,
                      category: related.category,
                      condition: related.condition,
                      location: related.location,
                      images: (related as unknown as { images?: unknown[] | null }).images ?? null,
                      status: related.status ?? "ACTIVE",
                      endsAt: null,
                      offerCount: (related as unknown as { _count?: { offers?: number } })._count?.offers ?? 0,
                      currentOffer: relatedCurrentOffer,
                      seller: {
                        name: related.seller?.name || related.seller?.username || null,
                        memberSince: related.seller?.createdAt ?? null,
                        location: related.seller?.location ?? null,
                        emailVerified: related.seller?.emailVerified ?? false,
                        phone: related.seller?.phone ?? null,
                      },
                    }}
                    initiallyWatched={false}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-8 text-center">
              <div className="text-base font-extrabold text-[#0F172A]">No related active listings yet</div>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#64748B]">Related listings appear as sellers publish real items in matching categories, locations, or seller inventories.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/listings" className="bd-btn bd-btn-secondary text-center">Browse all listings</Link>
                <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">Create a listing</Link>
              </div>
            </div>
          )}
        </section>

      </div>
    </ReferencePage>

  );
}
