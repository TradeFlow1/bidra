import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";
import ListingImageGallery from "@/components/listing-image-gallery";
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
  const isSold = listing.orders.length > 0 || listing.status !== "ACTIVE";
  const endsText = isTimedOffers ? formatTimeRemaining((listing as any).endsAt) : null;
  const topOffer = listing.offers.length ? listing.offers[0] : null;

  const sellerName = cleanText((listing.seller as any)?.name || (listing.seller as any)?.username || "Bidra seller");
  const sellerLocation = cleanText((listing.seller as any)?.location || listing.location || "Australia");
  const images = (listing as any).images || [];

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
                <div className="mt-2 text-sm text-[#78716C]">{endsText && endsText !== "Ended" ? "Offer window ends in " + endsText : "Offer window has ended"}</div>
              ) : null}

              <div className="mt-4 space-y-3">
                {isSold ? (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">Sold.</div>
                ) : isTimedOffers ? (
                  <div className="space-y-2">
                    <p className="text-sm text-[#64748B]">Place an offer. The seller can accept the highest offer to mark the item as sold.</p>
                    <PlaceOfferClient listingId={listing.id} minOfferCents={currentOffer ?? listing.price} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[#64748B]">Buy now marks this item as sold.</p>
                    <BuyNowButton listingId={listing.id} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <WatchlistButton listingId={listing.id} authed={!!userId} loginHref="/auth/login" />
                  <MessageSellerButton listingId={listing.id} />
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
                  <div className="mt-1.5 text-sm font-bold text-[#0F172A]">{isTimedOffers ? "Offers" : "Buy Now"}</div>
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
              <div className="mt-2 text-sm text-[#64748B]">{sellerLocation}</div>
              <div className="mt-2">
                <Link href={"/seller/" + listing.sellerId} className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-white">View seller profile</Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}