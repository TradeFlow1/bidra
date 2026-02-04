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
import CountdownClock from "@/components/countdown-clock";
import { isTimedOffersType } from "@/lib/listing-type";

export const dynamic = "force-dynamic";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)} AUD`;
}

function hoursUntil(date: Date | null | undefined) {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return ms / (1000 * 60 * 60);
}

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
      reservePrice: true,
      type: true,
      status: true,
      previousStatus: true,
      endsAt: true,
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
      bids: { orderBy: [{ amount: "desc" }, { createdAt: "desc" }], take: 10, select: { amount: true, bidderId: true, createdAt: true } },
      _count: { select: { bids: true } },
    },
  });

  if (!listing) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6 space-y-3">
          <div className="text-lg font-semibold">Listing not found.</div>
          <Link href="/listings" className="bd-btn bd-btn-ghost">← Back to listings</Link>
        </div>
      </main>
    );
  }

  const sellerId = (listing.seller as unknown as { id?: string })?.id as string;



  // Item 2: hide non-active listings from public direct view
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isSeller = !!(session?.user?.id && session.user.id === (listing as unknown as { sellerId?: string }).sellerId);
  const showReport = !!viewerId && !isSeller;

  if (!isSeller && !isAdmin && listing.status !== "ACTIVE") {
      const viewerOrder = viewerId
      ? await prisma.order.findFirst({
          where: { listingId: listing.id, buyerId: viewerId },
          select: { id: true, status: true, outcome: true },
        })
      : null;

    // Allow the buyer (who has an order) to still view the listing after Buy Now flips it to SOLD.
    if (!viewerOrder) {
      return (
        <main className="bd-container py-6 pb-14">
          <div className="bd-card p-6 space-y-3">
            <div className="text-lg font-semibold">This listing is not available.</div>
            <Link href="/listings" className="bd-btn bd-btn-ghost">← Back to listings</Link>
          </div>
        </main>
      );
    }
  }


  const soldCount = await prisma.listing.count({
    where: { sellerId, status: "SOLD" },
  });

  const activeCount = await prisma.listing.count({
    where: { sellerId, status: "ACTIVE" },
  });

  const highestOfferCents = listing.bids && listing.bids.length ? Number((listing.bids[0] as unknown as { amount?: number }).amount ?? 0) : 0;

  const isTimedOffers = isTimedOffersType(listing.type);

  // Guide price is stored in listing.price (cents). For timed offers, this is the "expected around" anchor.
  const guidePriceCents = Number.isFinite(Number(listing.price)) ? Number(listing.price) : 0;

  // IMPORTANT: Highest offer should reflect the real ladder, not be forced up to guide price.
  const currentOfferCents = highestOfferCents;

  function roundUpToInc(cents: number, inc: number) {
    const n = Number.isFinite(Number(cents)) ? Number(cents) : 0;
    const i = Number.isFinite(Number(inc)) && inc > 0 ? Number(inc) : 1;
    return Math.ceil(n / i) * i;
  }

    // Minimum offer is ladder-based (visible offers model):
  // - If no offers yet: allow a low opening offer (not forced up to guide)
  // - Otherwise: +$10 above highest offer (rounded to $10)
  const minOfferBase = highestOfferCents > 0 ? (highestOfferCents + 1000) : 1000;
  const minOfferCents = roundUpToInc(minOfferBase, 1000);
const hasAnyOffer = highestOfferCents > 0;

  const offersCount = (listing as unknown as { _count?: { bids?: number } })?._count?.bids ?? 0;

// Ladder display should show unique buyers (proxy offers may create multiple offer rows per buyer)
type LadderBid = { bidderId?: string; amount?: number; createdAt?: Date | string | number };

const ladderRows = ((((listing as unknown as { bids?: unknown[] }).bids) as unknown[]) ?? [])
  .reduce((acc: Record<string, LadderBid>, b: unknown) => {
    const bb = (b as LadderBid) ?? {};
    const id = String(bb.bidderId ?? "");
    if (!id) return acc;

    const cur = acc[id];
    if (!cur) acc[id] = bb;
    else {
      const curAmt = Number(cur.amount ?? 0);
      const bAmt = Number(bb.amount ?? 0);
      const curT = new Date(cur.createdAt ?? 0).getTime();
      const bT = new Date(bb.createdAt ?? 0).getTime();
      if (bAmt > curAmt || (bAmt === curAmt && bT > curT)) acc[id] = bb;
    }
    return acc;
  }, {} as Record<string, LadderBid>);

const ladderTop = Object.values(ladderRows)
  .sort((a: LadderBid, b: LadderBid) => {
    const da = Number(a?.amount ?? 0);
    const db = Number(b?.amount ?? 0);
    if (db !== da) return db - da;
    const ta = new Date(a?.createdAt ?? 0).getTime();
    const tb = new Date(b?.createdAt ?? 0).getTime();
    return tb - ta;
  })
  .slice(0, 6);




  const topBidderId = (ladderTop && (ladderTop as unknown as Array<{ bidderId?: string }>).length) ? String((ladderTop as unknown as Array<{ bidderId?: string }>)[0]?.bidderId ?? "") : null;
  const viewerHasMax = viewerId
    ? !!(await prisma.offerMax.findUnique({
        where: { listingId_bidderId: { listingId: (listing as unknown as { id: string }).id, bidderId: viewerId } },
        select: { id: true },
      }))
    : false;
    const viewerHasAnyOffer = viewerId
    ? (viewerHasMax || ((((listing as unknown as { bids?: unknown[] }).bids) as unknown[]) ?? []).some((b: unknown) => String((b as { bidderId?: string } | null | undefined)?.bidderId ?? "") === String(viewerId)))
    : false;
const offerState: "NONE" | "TOP" | "OUTOFFERED" =
    !viewerId
      ? "NONE"
      : (topBidderId === viewerId ? "TOP" : (viewerHasMax ? "OUTOFFERED" : "NONE"));
    const guideExceeded = hasAnyOffer && guidePriceCents > 0 && highestOfferCents >= guidePriceCents;
  const normalizedTitle = String((listing as unknown as { title?: string })?.title ?? "").replace(/\s+/g, " ").trim();

  const sellerName =
    (listing.seller as unknown as { username?: string; name?: string; email?: string })?.username ?? (listing.seller as unknown as { username?: string; name?: string; email?: string })?.name ?? (listing.seller as unknown as { username?: string; name?: string; email?: string })?.email ?? "Seller";

  const rawDescriptionText = String(listing.description ?? "").trim();

// Scrub common placeholder text that should never appear publicly
const scrubbedDescriptionText = rawDescriptionText
  .replace(/\(add what''s included\)/gi, "")
  .replace(/\(add what's included\)/gi, "")
  .replace(/included:\s*\(.*?\)/gi, "Included:")
  .replace(/\bTBD\b/gi, "")
  .replace(/\bExample:\b.*$/gmi, "")
  .trim();

  const rawBuyNow = (listing as unknown as { buyNowPrice?: unknown }).buyNowPrice;
  const buyNowEnabled = Boolean((listing as unknown as { buyNowEnabled?: unknown }).buyNowEnabled);
  const buyNowHasPrice = typeof rawBuyNow === "number";
  const buyNowPriceCents =
    listing.type === "FIXED_PRICE"
      ? guidePriceCents
      : (buyNowHasPrice ? (rawBuyNow as number) : null);
  // Kevin model:
  // - No Buy Now shown initially on timed offers.
  // - Buy Now may be revealed late-stage (final 24h), seller-controlled by setting buyNowPrice.
  // For FIXED_PRICE, Buy Now remains the primary path.
  const hoursLeft = hoursUntil(((listing as unknown as { endsAt?: Date | null | undefined }).endsAt) ?? undefined);
  const isFinalWindow = typeof hoursLeft === "number" ? hoursLeft <= 24 : false;
  const isEnded = listing.status !== "ACTIVE" || (typeof hoursLeft === "number" && hoursLeft <= 0);
  const urgencyText =
    typeof hoursLeft !== "number"
      ? null
      : hoursLeft <= 1
      ? "Ending shortly — seller decision pending"
      : hoursLeft <= 6
      ? "Final hours — strong interest"
      : hoursLeft <= 24
      ? "Ending soon — seller reviewing offers"
      : null;

  const showCountdown = Boolean((listing as unknown as { endsAt?: unknown }).endsAt) && listing.status === "ACTIVE";
  const endsAtIso = (listing as unknown as { endsAt?: unknown }).endsAt ? new Date((listing as unknown as { endsAt?: unknown }).endsAt as Date | string | number).toISOString() : null;
  const buyNowVisible =
    listing.status === "ACTIVE" && Boolean(viewerId) && !isSeller &&
    (
      // FIXED_PRICE: primary path (fallback to price when buyNowPrice not set)
      (listing.type === "FIXED_PRICE" && buyNowPriceCents != null && buyNowPriceCents > 0) ||
      // Timed offers: Buy Now is ONLY late-stage AND must be ABOVE current highest offer.
      (isTimedOffers && isFinalWindow && buyNowEnabled && buyNowPriceCents != null && buyNowPriceCents > highestOfferCents)
    );
  // Pressure ramp is based on GUIDE price (Kevin model: ~70–80%).
  const pressure = isTimedOffers && guidePriceCents > 0 ? highestOfferCents >= Math.floor(guidePriceCents * 0.75) : false;
  const showSocialProof = offersCount >= 3 && (pressure || guideExceeded);


  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-5 max-w-6xl mx-auto">
        <div className="space-y-3">
          <Link href="/listings" className="bd-btn bd-btn-ghost">← Back</Link>
          <h1 className="text-2xl font-bold">{String((listing as unknown as { title?: string })?.title ?? "")}</h1>
        </div>

        <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-6">
          {/* Left column */}
          <div className="sm:col-span-2 space-y-4">
            <ListingImageGallery images={(listing as unknown as { images?: unknown[] }).images ?? []} title={String((listing as unknown as { title?: string })?.title ?? "")} />

            <div className="text-sm text-neutral-600">
              Seller:{" "}
              <Link href={`/seller/${sellerId}`} className="underline">
                {sellerName}
              </Link>
            </div>

            <TrustPanel
              username={sellerName}
              suburb={(listing.seller as unknown as { suburb?: string })?.suburb}
              state={(listing.seller as unknown as { state?: string })?.state}
              joinedAt={(listing.seller as unknown as { createdAt?: Date | string })?.createdAt}
              activeCount={activeCount}
              soldCount={soldCount}
            />

            <div className="flex gap-2 flex-wrap">
              <Badge>{isTimedOffers ? "Timed offers" : "Fixed price"}</Badge>
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
              {showReport ? <ReportListingButton listingId={(listing as unknown as { id: string }).id} /> : null}

              <div>
                {session?.user?.id === (listing as unknown as { sellerId?: string }).sellerId ? (
                  <div className="bd-card p-4">
                    <div className="text-sm font-semibold">This is your listing</div>
                    <div className="mt-2 text-xs text-neutral-600">Buyers can message you from this page.</div>
                  </div>
                ) : (
                  viewerId ? (
                    <MessageSellerButton listingId={(listing as unknown as { id: string }).id} />
                  ) : (
                    <div className="bd-card p-4">
                      <div className="text-sm font-semibold">Log in to message seller</div>
                      <div className="mt-2 text-xs text-neutral-600">Messaging is available after you log in.</div>
                      <ClickableLink
                        href={`/auth/login?next=/listings/${(listing as unknown as { id: string }).id}`}
                        className="mt-3 inline-flex text-xs"
                      >
                        Log in
                      </ClickableLink>
                      <div className="mt-3 text-xs text-black/60">
                        Tip: keep personal info minimal until you&apos;re confident.
                      </div>
                    </div>
                  )
                )}
              </div>
              {session?.user?.id && (isAdmin || (listing as unknown as { sellerId?: string }).sellerId === session.user.id) ? <DeleteListingButton id={(listing as unknown as { id: string }).id} /> : null}

              {isSeller ? (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <div>
                      <Link href={`/sell/edit/${(listing as unknown as { id: string }).id}`} className="bd-btn bd-btn-primary" prefetch={false}>
                        Edit listing
                      </Link>
                      <div className="mt-1 text-xs bd-ink2">Edit title, price, description, and photos.</div>
                    </div>
                  </div>
{listing.status === "ENDED" ? (
  <div>
    <RelistButton listingId={(listing as unknown as { id: string }).id} />
  </div>
) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right column */}
          <div className="mt-5 sm:mt-0 sm:col-span-1 space-y-4 sm:sticky sm:top-24 self-start">
            {isTimedOffers ? (
              <>
                <div className="bd-card p-4">
                  <div className="space-y-2">
                    <div className={`text-sm ${guideExceeded ? "text-neutral-500" : "text-neutral-700"}`}>
                      {guideExceeded ? "Early guide:" : "Guide price:"}{" "}
                      <span className="font-semibold">{formatMoney(guidePriceCents)}</span>
                    </div>

                    <div className="text-2xl font-extrabold">
                      {hasAnyOffer ? formatMoney(highestOfferCents) : "No offers yet."}
                    </div>
                    <div className="text-xs text-neutral-600">Highest offer</div>
                    {listing.bids && listing.bids.length ? (
                      <div className="pt-3">
                        <div className="text-xs text-neutral-600">Offer ladder (top buyers)</div>
                        <div className="mt-2 space-y-1">
                          {(ladderTop as unknown as Array<{ bidderId?: string; amount?: number }>).map((b, idx) => (
                            <div key={`${b.bidderId}-${b.amount}-${idx}`} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${viewerId && b.bidderId === viewerId ? "bg-[var(--bidra-link)]/10" : ""}`}>
                              <div className="text-neutral-600">{viewerHasAnyOffer && viewerId && b.bidderId === viewerId ? "You" : `#${idx + 1}`}</div>
                              <div className="font-semibold text-neutral-900">{formatMoney(Number(b.amount ?? 0))}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="text-neutral-600">Offers</div>
                      <div className="text-neutral-900 text-right">{offersCount > 0 ? `${offersCount}` : "0"}</div>

                      <div className="text-neutral-600">Activity</div>
                      <div className="text-neutral-900 text-right">{showSocialProof ? "Multiple buyers" : (offersCount > 0 ? "Active" : "Quiet")}</div>

                      <div className="text-neutral-600">Timing</div>
                      <div className="text-neutral-900 text-right">{showCountdown ? (<span><span className="text-xs text-neutral-600 mr-2">Time remaining</span><CountdownClock endsAt={endsAtIso} /></span>) : (urgencyText ? urgencyText : (isFinalWindow ? "Final 24h" : "In progress"))}</div>

                      <div className="text-neutral-600">Interest</div>
                      <div className="text-neutral-900 text-right">{pressure ? "Strong" : (guideExceeded ? "Above guide" : "Normal")}</div>
                    </div>

                    {buyNowVisible ? (
                      <div className="pt-3">
                        <BuyNowButton listingId={(listing as unknown as { id: string }).id} />
<div className="mt-1 text-xs text-neutral-600">Buy Now is a binding purchase. If you continue, you'll create an order and go to payment.</div>
                      </div>
                    ) : (
                      <>
                      <div className="pt-3 text-xs text-neutral-600">Buy Now may appear in the final 24 hours.</div>
                      <div className="mt-2 text-xs text-neutral-600">Offers are not an automatic sale. After this listing ends, the seller may accept an offer (usually the highest).</div>
                      </>
                    )}
                  </div>
                </div>

                {isSeller ? (
                  <div className="bd-card p-4">
                    <div className="text-sm font-semibold">Seller action</div>
                    <div className="mt-2">
                      {isEnded && hasAnyOffer ? (
                        <AcceptHighestOfferButton listingId={(listing as unknown as { id: string }).id} />
                      ) : (
                        <div className="text-xs text-neutral-600">
                          You can proceed with the highest offer after the listing ends and at least one offer exists.
                        </div>
                      )}
                    </div>
                  </div>
                ) : isEnded ? (
                  <div className="bd-card p-4">
                    <div className="text-sm font-semibold">Offers closed</div>
                    <div className="mt-2 text-xs text-neutral-600">Listing ended — seller reviewing offers.</div>
                    <div className="mt-2 text-xs text-neutral-600">Offers are not an automatic sale. After this listing ends, the seller may accept an offer (usually the highest).</div>
                  </div>
                ) : (
                  <div className="bd-card p-4">
                    {viewerId ? (
                      <>
                        <div className="text-sm font-semibold">Place an offer</div>
                        <div className="mt-2">
                          <PlaceOfferClient
                            listingId={(listing as unknown as { id: string }).id}
                            minOfferCents={minOfferCents}
                            offerState={(offerState === "OUTOFFERED" ? "OUTBID" : offerState)}
                            viewerHasAnyOffer={viewerHasAnyOffer}
                            disabled={isEnded || isSeller}
                            disabledText={isSeller ? "Sellers cannot place offers on their own listing." : "Waiting for seller decision."}
                          />
                          <div className="mt-2 text-xs text-neutral-600">
                            Offers are not an automatic sale. After this listing ends, the seller may accept an offer (usually the highest).
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold">Log in to place an offer</div>
                        <div className="mt-2 text-xs text-neutral-600">
                          Offers are not an automatic sale. After this listing ends, the seller may accept an offer (usually the highest).
                        </div>
                        <ClickableLink
                          href={`/auth/login?next=/listings/${(listing as unknown as { id: string }).id}`}
                          className="mt-3 inline-flex text-xs"
                        >
                          Log in
                        </ClickableLink>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bd-card p-4 space-y-3">
                <div className="text-sm font-semibold">Price</div>
                <div className="text-2xl font-extrabold">{formatMoney(guidePriceCents)}</div>
                {buyNowVisible ? (
                  <div className="space-y-1">
                    <BuyNowButton listingId={(listing as unknown as { id: string }).id} />
                    <div className="text-xs text-neutral-600">Buy Now is a binding purchase. If you continue, you'll create an order and go to payment.</div>
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
