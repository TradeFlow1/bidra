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
          <Link href="/listings" className="bd-btn bd-btn-ghost">â† Back to listings</Link>
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
            <Link href="/listings" className="bd-btn bd-btn-ghost">â† Back to listings</Link>
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

  const minOfferBase = highestOfferCents > 0 ? (highestOfferCents + 1000) : 1000;
  const minOfferCents = roundUpToInc(minOfferBase, 1000);

  const ladderRows = offers.reduce(function (acc: Record<string, OfferRow>, b: OfferRow) {
    const id = String(b?.buyerId ?? "");
    if (!id) return acc;

    const cur = acc[id];
    if (!cur) {
      acc[id] = b;
    } else {
      const curAmt = Number(cur.amount ?? 0);
      const nextAmt = Number(b.amount ?? 0);
      const curT = new Date(cur.createdAt ?? 0).getTime();
      const nextT = new Date(b.createdAt ?? 0).getTime();
      if (nextAmt > curAmt || (nextAmt === curAmt && nextT > curT)) {
        acc[id] = b;
      }
    }

    return acc;
  }, {} as Record<string, OfferRow>);

  const ladderTop = Object.values(ladderRows)
    .sort(function (a: OfferRow, b: OfferRow) {
      const da = Number(a?.amount ?? 0);
      const db = Number(b?.amount ?? 0);
      if (db !== da) return db - da;
      const ta = new Date(a?.createdAt ?? 0).getTime();
      const tb = new Date(b?.createdAt ?? 0).getTime();
      return tb - ta;
    })
    .slice(0, 6);

  const topBuyerId = ladderTop.length ? String(ladderTop[0]?.buyerId ?? "") : null;
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
          <Link href="/listings" className="bd-btn bd-btn-ghost">â† Back</Link>
          <h1 className="text-2xl font-bold">{String(listing.title ?? "")}</h1>
        </div>

        <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-6">
          <div className="sm:col-span-2 space-y-4">
            <ListingImageGallery images={listing.images ?? []} title={String(listing.title ?? "")} />

            <div className="text-sm text-neutral-600">
              Seller{" "}
              <Link href={`/seller/${sellerId}`} className="underline">
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



              {session?.user?.id && (isAdmin || listing.sellerId === session.user.id) ? <DeleteListingButton id={listing.id} /> : null}

              {isSeller ? (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <div>
                      <Link href={`/sell/edit/${listing.id}`} className="bd-btn bd-btn-primary" prefetch={false}>
                        Edit listing
                      </Link>
                      <div className="mt-1 text-xs bd-ink2">Edit title, price, description, and photos.</div>
                    </div>
                  </div>
                  {listing.status === "ENDED" ? (
                    <div>
                      <RelistButton listingId={listing.id} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 sm:mt-0 sm:col-span-1 space-y-4 sm:sticky sm:top-24 self-start">
            {isOfferable ? (
              <>
                <div className="bd-card p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-700">
                      Guide price{" "}
                      <span className="font-semibold">{formatMoney(guidePriceCents)}</span>
                    </div>

                    <div className="text-2xl font-extrabold">
                      {hasAnyOffer ? formatMoney(highestOfferCents) : "No offers yet."}
                    </div>
                    <div className="text-xs text-neutral-600">Highest offer</div>

                    {ladderTop.length ? (
                      <div className="pt-3">
                        <div className="text-xs text-neutral-600">Offer ladder</div>
                        <div className="mt-2 space-y-1">
                          {ladderTop.map(function (b, idx) {
                            const isViewer = !!viewerId && String(b?.buyerId ?? "") === String(viewerId);
                            return (
                              <div key={`${String(b?.buyerId ?? "")}-${String(b?.amount ?? 0)}-${idx}`} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${isViewer ? "bg-[var(--bidra-link)]/10" : ""}`}>
                                <div className="text-neutral-600">{isViewer ? "You" : `#${idx + 1}`}</div>
                                <div className="font-semibold text-neutral-900">{formatMoney(Number(b?.amount ?? 0))}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="text-neutral-600">Offers</div>
                      <div className="text-neutral-900 text-right">{offersCount}</div>

                      <div className="text-neutral-600">Status</div>
                      <div className="text-neutral-900 text-right">{listing.status}</div>
                    </div>


                  </div>
                </div>

                <div className="bd-card p-4">
                  <div className="text-sm font-semibold tracking-tight">Next step</div>

                  {isSeller ? (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs text-neutral-600">This is your listing.</div>

                      {isEnded && hasAnyOffer ? (
                        <AcceptHighestOfferButton listingId={listing.id} />
                      ) : (
                        <div className="text-xs text-neutral-600">
                          You can accept the highest offer once the listing ends.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">

                      {buyNowVisible ? (
                        <div className="space-y-1 p-3 rounded-lg border border-black/10 bg-white shadow-sm">
                          <div className="text-xs font-semibold text-neutral-900 tracking-tight">Buy Now</div><div className="text-[11px] text-neutral-500">Secure this item instantly</div>
                          <div className="mt-1"><BuyNowButton listingId={listing.id} /></div>
                          <div className="text-xs text-neutral-600">
                            Instant purchase. This item will be marked as sold.
                          </div>
                        </div>
                      ) : null}

                      {isEnded ? (
                        <div className="text-xs text-neutral-600">
                          This listing has ended. The seller is reviewing offers.
                        </div>
                      ) : viewerId ? (
                        <div className="space-y-1 p-3 rounded-lg border border-black/10 bg-white shadow-sm">
                          <div className="text-xs font-semibold text-neutral-900">Make an offer</div>
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
                        <div className="space-y-1 p-3 rounded-lg border border-black/10 bg-white shadow-sm">
                          <div className="text-xs font-semibold text-neutral-900">Make an offer</div>
                          <ClickableLink
                            href={`/auth/login?next=/listings/${listing.id}`}
                            className="mt-2 inline-flex text-xs"
                          >
                            Log in
                          </ClickableLink>
                        </div>
                      )}

                      <div className="border-t border-black/10 pt-3 space-y-1">
                        <div className="text-xs font-semibold text-neutral-900">Questions</div>
                        {viewerId ? (
                          <MessageSellerButton listingId={listing.id} />
                        ) : (
                          <ClickableLink
                            href={`/auth/login?next=/listings/${listing.id}`}
                            className="mt-2 inline-flex text-xs"
                          >
                            Log in to message seller
                          </ClickableLink>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bd-card p-4 space-y-3">
                <div className="text-sm font-semibold">Price</div>
                <div className="text-2xl font-extrabold">{formatMoney(guidePriceCents)}</div>
                {buyNowVisible ? (
                  <div className="space-y-1 p-3 rounded-lg border border-black/10 bg-white shadow-sm">
                    <div className="mt-1"><BuyNowButton listingId={listing.id} /></div>
                    <div className="text-xs text-neutral-600">Instant purchase. This item will be marked as sold. If you continue, you will create an order.</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}






