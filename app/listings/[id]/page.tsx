import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";
import ListingImageGallery from "@/components/listing-image-gallery";
import ShareActions from "@/components/share-actions";
import BuyNowButton from "./buy-now-button";
import PlaceOfferClient from "./place-offer-client";
import AcceptHighestOfferButton from "./accept-highest-offer-button";
import WatchlistButton from "./watchlist-button";
import MessageSellerButton from "./message-seller-button";
import ReportListingButton from "./report-listing-button";
import DeleteListingButton from "./delete-listing-button";
import RelistButton from "./relist-button";

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
  const images = (listing as any).images || [];
  const baseUrl = getBaseUrl();
  const listingUrl = `${baseUrl}/listings/${listing.id}`;

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6 lg:py-5">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
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
                    {isTimedOffers ? "Make an offer" : "Buy now"}
                  </span>
                  {listing.condition ? (
                    <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{cleanText(listing.condition)}</span>
                  ) : null}
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-[2.2rem]">{cleanText(listing.title)}</h1>

                <div className="mt-2 text-sm text-[#64748B]">
                  <span>{cleanText(listing.location) || "Location on request"}</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm">
                <div className="p-3 sm:p-4">
                  <ListingImageGallery images={images} title={cleanText(listing.title)} />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D8E1F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Highest offer" : "Price"}</div>
              <div className="mt-1 text-[1.85rem] font-extrabold tracking-tight text-[#0F172A]">{money(displayPrice)}</div>

              {isTimedOffers ? (
                <div className="mt-2 rounded-2xl border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#475569]">
                  <div>{currentOffer !== null ? "Current highest offer: " + money(currentOffer) : "No offers yet."}</div>
                  <div>{offerCount} {offerCount === 1 ? "offer" : "offers"}</div>
                  <div>{offerWindowText}</div>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {isSold ? (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">Sold.</div>
                ) : isTimedOffers ? (
                  <div className="space-y-2">
                    <p className="text-sm text-[#64748B]">Offers let the seller choose whether to accept. Keep questions in Messages.</p>
                    <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[#64748B]">Buy Now creates a sold-item record so you and the seller can arrange the handover.</p>
                    <BuyNowButton listingId={listing.id} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <WatchlistButton listingId={listing.id} authed={!!userId} loginHref="/auth/login" />
                  <MessageSellerButton listingId={listing.id} />
                </div>
                <ShareActions
                  url={listingUrl}
                  title={cleanText(listing.title)}
                  text={`Take a look at this listing on Bidra: ${cleanText(listing.title)}`}
                  label="Share listing"
                />

                <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-3">
                  <div className="text-sm font-semibold text-[#0F172A]">What happens next</div>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[#475569]">
                    <li>Ask questions before you buy if anything is unclear.</li>
                    <li>After a sale, use Messages to arrange pickup or postage.</li>
                    <li>Keep pickup, postage, and payment details in Bidra messages.</li>
                    <li>Check photos, description, condition, location, and seller profile.</li>
                    <li>Meet safely for pickup or use tracked postage where practical.</li>
                    <li>If anything feels suspicious, report the listing.</li>
                  </ul>
                </div>
              </div>

              {isOwner && isTimedOffers && !isSold && topOffer ? (
                <div className="mt-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-3.5">
                  <div className="mt-1 text-sm font-semibold text-[#92400E]">Accept the highest offer to mark this listing as sold.</div>
                  <div className="mt-2">
                    <AcceptHighestOfferButton listingId={listing.id} />
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

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="space-y-3">
            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-3 shadow-sm">
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-3">
                <div className="rounded-2xl bg-[#F8FAFC] p-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Type</div>
                  <div className="mt-1.5 text-sm font-bold text-[#0F172A]">{isTimedOffers ? "Make an offer" : "Buy now"}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Condition</div>
                  <div className="mt-1.5 text-sm font-bold text-[#0F172A]">{cleanText(listing.condition) || "Not specified"}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Category</div>
                  <div className="mt-1.5 text-sm font-bold text-[#0F172A]">{cleanText(listing.category) || "Marketplace"}</div>
                </div>
              </div>

              <div className="mt-2">
                <p className="whitespace-pre-wrap text-sm leading-[1.55] text-[#334155]">{cleanText(listing.description).replace(/Selling:\s*/gi, "").replace(/Condition:\s*/gi, "").replace(/Details:\s*/gi, "").trim() || "No description provided."}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Seller</div>
              <div className="mt-1.5 text-[1.7rem] font-extrabold tracking-tight text-[#0F172A]">{sellerName}</div>
              <div className="mt-2 space-y-1 text-sm text-[#64748B]">
                <div>{sellerLocation}</div>
                {sellerMemberSince ? <div>Member since {sellerMemberSince}</div> : null}
                <div>{sellerActiveListings} active listings</div>
              </div>
              {(sellerEmailVerified || sellerPhoneVerified || (typeof sellerRatingAvg === "number" && sellerRatingCount > 0)) ? (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {sellerEmailVerified ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">Email verified</span> : null}
                  {sellerPhoneVerified ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">Phone verified</span> : null}
                  {(typeof sellerRatingAvg === "number" && sellerRatingCount > 0) ? (
                    <span className="font-semibold text-amber-700">{"★".repeat(Math.round(Math.max(0, Math.min(5, sellerRatingAvg)))) + "☆".repeat(5 - Math.round(Math.max(0, Math.min(5, sellerRatingAvg))))} ({sellerRatingCount})</span>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-2">
                <Link href={"/seller/" + listing.sellerId} className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View seller profile</Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Trust tips</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#475569]">
                <li>Meet in a safe public place for local pickup.</li>
                <li>Inspect the item before paying.</li>
                <li>Use messages to confirm details.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
