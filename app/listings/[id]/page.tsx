import { labelCategory, labelCondition } from "@/lib/labels";
import Link from "next/link";
import { ClickableLink } from "@/components/clickable-link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TrustPanel from "@/components/trust/trust-panel";
import PlaceOfferClient from "./place-offer-client";
import AcceptHighestOfferButton from "./accept-highest-offer-button";
import BuyNowButton from "./buy-now-button";
import RelistButton from "./relist-button";
import DeleteListingButton from "./delete-listing-button";
import ReportListingButton from "./report-listing-button";
import MessageSellerButton from "./message-seller-button";
import { Badge } from "@/components/ui";
import ListingImageGallery from "@/components/listing-image-gallery";

export const dynamic = "force-dynamic";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)} AUD`;
}

function roundUpToInc(cents: number, inc: number) {
  const n = Number.isFinite(Number(cents)) ? Number(cents) : 0;
  const i = Number.isFinite(Number(inc)) && inc > 0 ? Number(inc) : 1;
  return Math.ceil(n / i) * i;
}

type OfferRow = { buyerId?: string; amount?: number; createdAt?: Date | string | number };

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      buyNowPrice: true,
      buyNowEnabled: true,
      type: true,
      status: true,
      previousStatus: true,
      category: true,
      condition: true,
      location: true,
      images: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          suburb: true,
          state: true,
          createdAt: true,
        },
      },
      offers: {
        orderBy: [{ amount: "desc" }, { createdAt: "desc" }],
        take: 10,
        select: { amount: true, buyerId: true, createdAt: true },
      },
      _count: { select: { offers: true } },
    },
  });

  if (!listing) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6 space-y-3">
          <div className="text-lg font-semibold">Listing not found.</div>
          <Link href="/listings" className="bd-btn bd-btn-ghost">Back to listings</Link>
        </div>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isSeller = !!(viewerId && viewerId === listing.sellerId);
  const showReport = !!viewerId && !isSeller;

  if (!isSeller && !isAdmin && listing.status !== "ACTIVE") {
    const viewerOrder = viewerId
      ? await prisma.order.findFirst({
          where: { listingId: listing.id, buyerId: viewerId },
          select: { id: true, status: true, outcome: true },
        })
      : null;

    if (!viewerOrder) {
      return (
        <main className="bd-container py-6 pb-14">
          <div className="bd-card p-6 space-y-3">
            <div className="text-lg font-semibold">This listing is not available.</div>
          <Link href="/listings" className="bd-btn bd-btn-ghost">Back to listings</Link>
          </div>
        </main>
      );
    }
  }

  const sellerId = String(listing.seller?.id || "");
  const soldCount = await prisma.listing.count({ where: { sellerId: sellerId, status: "SOLD" } });
  const activeCount = await prisma.listing.count({ where: { sellerId: sellerId, status: "ACTIVE" } });

  const offers = ((listing.offers as unknown as OfferRow[]) || []);
  const highestOfferCents = offers.length ? Number(offers[0]?.amount ?? 0) : 0;
  const hasAnyOffer = highestOfferCents > 0;
  const offersCount = listing._count?.offers ?? 0;

  const guidePriceCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;
  const isOfferable = listing.type === "OFFERABLE";
  const isBuyNow = listing.type === "BUY_NOW";
  const isEnded = listing.status !== "ACTIVE";

  const minOfferCents = highestOfferCents > 0 ? (highestOfferCents + 1) : 1;

  const topBuyerId = offers.length ? String(offers[0]?.buyerId ?? "") : null;
  const viewerHasAnyOffer = viewerId ? offers.some(function (b: OfferRow) { return String(b?.buyerId ?? "") === String(viewerId); }) : false;

  const offerState: "NONE" | "TOP" | "OUTBID" =
    !viewerId
      ? "NONE"
      : (topBuyerId === viewerId ? "TOP" : (viewerHasAnyOffer ? "OUTBID" : "NONE"));

  const buyNowPriceCents = isBuyNow
    ? guidePriceCents
    : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : null);

  const buyNowVisible =
    listing.status === "ACTIVE" &&
    Boolean(viewerId) &&
    !isSeller &&
    buyNowPriceCents != null &&
    (isBuyNow || (isOfferable && buyNowPriceCents > highestOfferCents));

  const sellerName =
    listing.seller?.username ?? listing.seller?.name ?? listing.seller?.email ?? "Seller";

  const rawDescriptionText = String(listing.description ?? "").trim();
  const scrubbedDescriptionText = rawDescriptionText
    .replace(/\(add what's included\)/gi, "")
    .replace(/\(add what"s included\)/gi, "")
    .replace(/included:\s*\(.*?\)/gi, "Included:")
    .replace(/\bTBD\b/gi, "")
    .replace(/\bExample:\b.*$/gmi, "")
    .trim();

  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-5 max-w-6xl mx-auto">
        <div className="space-y-3">
          <Link href="/listings" className="bd-btn bd-btn-ghost">Back</Link>
          <h1 className="text-2xl font-bold">{String(listing.title ?? "")}</h1>
        </div>

        <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-6">
          <div className="sm:col-span-2 space-y-4">
            <ListingImageGallery images={listing.images ?? []} title={String(listing.title ?? "")} />

            <div className="text-sm text-neutral-600">
              Seller{" "}
              <Link href={`/seller/${sellerId}`} className="bd-btn bd-btn-ghost text-center">
                {sellerName}
              </Link>
            </div>

            <TrustPanel
              username={sellerName}
              suburb={listing.seller?.suburb}
              state={listing.seller?.state}
              joinedAt={listing.seller?.createdAt}
              activeCount={activeCount}
              soldCount={soldCount}
            />

            <div className="flex gap-2 flex-wrap">
              <Badge>{isOfferable ? "Offerable" : "Buy Now"}</Badge>
              <Badge>{labelCategory(listing.category)}</Badge>
              <Badge>{labelCondition(listing.condition)}</Badge>
            </div>

            <div className="pt-1">
              <div className="text-sm font-extrabold">Description</div>
              <div className="mt-2 rounded-xl border border-black/10 bg-white p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                {scrubbedDescriptionText ? scrubbedDescriptionText : "No description provided."}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {showReport ? <ReportListingButton listingId={listing.id} /> : null}

              {isSeller ? (
                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Manage listing</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/sell/edit/${listing.id}`}
                      className="bd-btn bd-btn-primary text-center"
                      prefetch={false}
                    >
                      Edit listing
                    </Link>
                    {listing.status === "ENDED" ? (
                      <RelistButton listingId={listing.id} />
                    ) : null}
                    {session?.user?.id && (isAdmin || listing.sellerId === session.user.id) ? (
                      <DeleteListingButton id={listing.id} />
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs bd-ink2">
                    Update price, description, photos, or relist when needed.
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 sm:mt-0 sm:col-span-1 space-y-4 sm:sticky sm:top-24 self-start">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{isOfferable ? "Offerable" : "Buy Now"}</Badge>
                  <Badge>{listing.status}</Badge>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {isOfferable ? "Guide price" : "Price"}
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">
                    {formatMoney(guidePriceCents)}
                  </div>
                </div>

                {isOfferable ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Highest offer</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight text-amber-950">
                      {hasAnyOffer ? formatMoney(highestOfferCents) : "No offers yet"}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="text-amber-800/80">Offers</div>
                      <div className="text-right font-semibold text-amber-950">{offersCount}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs text-neutral-700">
                    Buy Now listing. The first buyer to complete purchase secures the item.
                  </div>
                )}

                <div className="rounded-xl border border-black/10 bg-[var(--bidra-bg)] p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Fulfillment</div>
                  <div className="mt-1 text-sm text-neutral-800">
                    Pickup, delivery, or postage is arranged with the buyer after purchase.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              {isSeller ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-neutral-950">Seller view</div>
                    <div className="mt-1 text-xs text-neutral-600">This is your listing.</div>
                  </div>

                  {isOfferable ? (
                    isEnded && hasAnyOffer ? (
                      <AcceptHighestOfferButton listingId={listing.id} />
                    ) : (
                      <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs text-neutral-700">
                        You can accept the highest offer once the listing ends.
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs text-neutral-700">
                      Buyers can purchase instantly while this listing is active.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-neutral-950">Buy or make an offer</div>
                    <div className="mt-1 text-xs text-neutral-600">
                      Bidra keeps the buying flow simple: act now, then arrange the details with the seller.
                    </div>
                  </div>

                  {buyNowVisible ? (
                    <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Primary action</div>
                      <div className="text-sm font-semibold text-emerald-950">Buy Now</div>
                      <div className="text-xs text-emerald-900/80">Secure this item instantly before someone else does.</div>
                      <BuyNowButton listingId={listing.id} />
                      <div className="text-xs text-emerald-900/80">
                        This creates an order and marks the item as sold.
                      </div>
                    </div>
                  ) : null}

                  {isOfferable ? (
                    isEnded ? (
                      <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs text-neutral-700">
                        This listing has ended. The seller is reviewing offers.
                      </div>
                    ) : viewerId ? (
                      <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Offer action</div>
                        <div className="text-sm font-semibold text-neutral-950">Make an offer</div>
                        <PlaceOfferClient
                          listingId={listing.id}
                          minOfferCents={minOfferCents}
                          offerState={offerState}
                          viewerHasAnyOffer={viewerHasAnyOffer}
                          disabled={isEnded || isSeller}
                          disabledText={isSeller ? "Sellers cannot place offers on their own listing." : "Waiting for seller decision."}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Offer action</div>
                        <div className="text-sm font-semibold text-neutral-950">Make an offer</div>
                        <div className="text-xs text-neutral-600">Create an account or log in to make an offer.</div>
                        <ClickableLink
                          href={`/auth/login?next=/listings/${listing.id}`}
                          className="bd-btn bd-btn-primary text-center"
                        >
                          Log in or create account
                        </ClickableLink>
                      </div>
                    )
                  ) : null}

                  <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Questions</div>
                    <div className="mt-1 text-sm text-neutral-800">Message the seller before or after purchase.</div>
                    <div className="mt-3">
                      {viewerId ? (
                        <MessageSellerButton listingId={listing.id} />
                      ) : (
                        <ClickableLink
                          href={`/auth/login?next=/listings/${listing.id}`}
                          className="bd-btn bd-btn-primary text-center"
                        >
                          Log in to buy, offer, or message seller
                        </ClickableLink>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}











