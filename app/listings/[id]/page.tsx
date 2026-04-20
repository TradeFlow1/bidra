import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";
import ListingImageGallery from "@/components/listing-image-gallery";
import TrustPanel from "@/components/trust/trust-panel";
import ReputationBadges from "@/components/reputation-badges";
import SafetyCallout from "@/components/safety-callout";
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
  return String(value ?? "").replace(/\s+/g, " ").trim();
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
      seller: true,
      offers: {
        orderBy: { amount: "desc" },
        include: { buyer: true },
      },
      orders: true,
    },
  });

  if (!listing) notFound();

  const isOwner = !!userId && listing.sellerId === userId;
  const isTimedOffers = isTimedOffersType(listing.type);
  const currentOffer = listing.offers.length ? listing.offers[0].amount : null;
  const displayPrice = isTimedOffers ? (currentOffer ?? listing.price) : (listing.buyNowPrice ?? listing.price);
  const buyNowPrice = typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : null;
  const isSold = listing.orders.length > 0 || listing.status !== "ACTIVE";
  const endsText = isTimedOffers ? formatTimeRemaining((listing as any).endsAt) : null;
  const topOffer = listing.offers.length ? listing.offers[0] : null;

  const sellerName = cleanText((listing.seller as any)?.name || (listing.seller as any)?.username || "Bidra seller");
  const sellerLocation = cleanText((listing.seller as any)?.location || listing.location || "Australia");

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{listing.category || "Marketplace listing"}</span>
                <span className={isTimedOffers
                  ? "rounded-full border border-amber-200 bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800"
                  : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800"
                }>{isTimedOffers ? "Highest Offers" : "Buy Now"}</span>
                {listing.condition ? <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">{listing.condition}</span> : null}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{listing.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
                <span>{listing.location || "Location available on request"}</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>Seller: {sellerName}</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{sellerLocation}</span>
              </div>


            </div>

            <div className="w-full max-w-[22rem] rounded-[28px] border border-[#D8E1F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Current top offer" : "Buy now price"}</div>
              <div className="mt-2 text-[2rem] font-extrabold tracking-tight text-[#0F172A]">{money(displayPrice)}</div>

              {isTimedOffers ? (
                <div className="mt-2 text-sm text-[#78716C]">
                  {endsText && endsText !== "Ended" ? "Listing ends in " + endsText + "." : "Place your strongest offer while the listing is active."}
                </div>
              ) : (
                <div className="mt-2 text-sm text-[#64748B]">
                  {buyNowPrice !== null ? "Secure this item instantly at the listed price." : "This listing is available at a fixed price."}
                </div>
              )}

              <div className="mt-5 space-y-3">
                {isSold ? (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">This listing is no longer available.</div>
                ) : isTimedOffers ? (
                  <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                ) : (
                  <BuyNowButton listingId={listing.id} />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <WatchlistButton listingId={listing.id} authed={!!userId} loginHref={"/auth/login"} />
                  <MessageSellerButton listingId={listing.id} />
                </div>
              </div>

              {isOwner && isTimedOffers && !isSold && topOffer ? (
                <div className="mt-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">Seller action</div>
                  <div className="mt-2 text-sm font-semibold text-[#92400E]">Accept the current highest offer when you are ready.</div>
                  <div className="mt-3">
                    <AcceptHighestOfferButton listingId={listing.id} />
                  </div>
                </div>
              ) : null}

              {isOwner ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <DeleteListingButton id={listing.id} />
                  <RelistButton listingId={listing.id} />
                </div>
              ) : null}

              <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                <ReportListingButton listingId={listing.id} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[32px] border border-[#D8E1F0] bg-white shadow-sm">
              <div className="p-4 sm:p-5">
                <ListingImageGallery images={(listing as any).images || []} title={listing.title} />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">About this listing</div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">Listing details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Sale type</div>
                  <div className="mt-2 text-sm font-bold text-[#0F172A]">{isTimedOffers ? "Highest Offers" : "Buy Now"}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Condition</div>
                  <div className="mt-2 text-sm font-bold text-[#0F172A]">{listing.condition || "Not specified"}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Location</div>
                  <div className="mt-2 text-sm font-bold text-[#0F172A]">{listing.location || "Not specified"}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Category</div>
                  <div className="mt-2 text-sm font-bold text-[#0F172A]">{listing.category || "Marketplace"}</div>
                </div>
              </div>

              <div className="mt-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#334155]">{listing.description || "No additional description provided."}</p>
              </div>
            </div>

            {isTimedOffers ? (
              <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Offer activity</div>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">Highest offer status</h2>
                  </div>
                  <div className="rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1 text-sm font-semibold text-[#334155]">{listing.offers.length} offers</div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">Current top offer</div>
                    <div className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">{money(currentOffer ?? listing.price)}</div>
                    <div className="mt-1 text-sm text-[#92400E]">{endsText && endsText !== "Ended" ? "Listing ends in " + endsText : "Offer activity available while listing remains active."}</div>
                  </div>
                  <div className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">How it works</div>
                    <div className="mt-2 text-sm leading-6 text-[#475569]">Place your strongest offer. The seller can review the top offer and accept when ready.</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Seller profile</div>
              <div className="mt-2 text-xl font-extrabold tracking-tight text-[#0F172A]">{sellerName}</div>
              <div className="mt-2 text-sm text-[#64748B]">{sellerLocation}</div>
              <div className="mt-4">
                <Link href={"/seller/" + listing.sellerId} className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View seller profile</Link>
              </div>
            </div>


            <div className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <SafetyCallout />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}