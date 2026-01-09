import Link from "next/link";
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
import PhotosManager from "./photos-manager";

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
          <Link href="/listings" className="bd-link text-sm">
            ← Back to listings
          </Link>
        </div>
      </main>
    );
  }

  const sellerId = (listing.seller as any)?.id as string;



  // Item 2: hide non-active listings from public direct view
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
  const isSeller = !!(session?.user?.id && session.user.id === (listing as any).sellerId);

  if (!isSeller && !isAdmin && listing.status !== "ACTIVE") {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6 space-y-3">
          <div className="text-lg font-semibold">This listing is not available.</div>
          <Link href="/listings" className="bd-link text-sm">
            ← Back to listings
          </Link>
        </div>
      </main>
    );
  }


  const soldCount = await prisma.listing.count({
    where: { sellerId, status: "SOLD" },
  });

  const activeCount = await prisma.listing.count({
    where: { sellerId, status: "ACTIVE" },
  });

  const highestOfferCents = listing.bids && listing.bids.length ? Number((listing.bids[0] as any).amount ?? 0) : 0;

  const isTimedOffers = listing.type === "AUCTION";

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

  const offersCount = (listing as any)?._count?.bids ?? 0;

// Ladder display should show unique buyers (proxy offers may create multiple bid rows per buyer)
const ladderRows = (((listing as any).bids as any[]) ?? [])
  .reduce((acc: Record<string, any>, b: any) => {
    const id = String(b?.bidderId ?? "");
    if (!id) return acc;
    const cur = acc[id];
    if (!cur) acc[id] = b;
    else {
      const curAmt = Number(cur.amount ?? 0);
      const bAmt = Number(b.amount ?? 0);
      const curT = new Date(cur.createdAt ?? 0).getTime();
      const bT = new Date(b.createdAt ?? 0).getTime();
      if (bAmt > curAmt || (bAmt === curAmt && bT > curT)) acc[id] = b;
    }
    return acc;
  }, {} as Record<string, any>);

const ladderTop = Object.values(ladderRows)
  .sort((a: any, b: any) => {
    const da = Number(a?.amount ?? 0);
    const db = Number(b?.amount ?? 0);
    if (db !== da) return db - da;
    const ta = new Date(a?.createdAt ?? 0).getTime();
    const tb = new Date(b?.createdAt ?? 0).getTime();
    return tb - ta;
  })
  .slice(0, 6);




  const topBidderId = (ladderTop && (ladderTop as any[]).length) ? String(((ladderTop as any[])[0] as any).bidderId ?? "") : null;
  const viewerId = session?.user?.id ?? null;
  const viewerHasMax = viewerId
    ? !!(await prisma.offerMax.findUnique({
        where: { listingId_bidderId: { listingId: (listing as any).id, bidderId: viewerId } },
        select: { id: true },
      }))
    : false;
  const offerState: "NONE" | "TOP" | "OUTBID" =
    !viewerId
      ? "NONE"
      : (topBidderId === viewerId ? "TOP" : (viewerHasMax ? "OUTBID" : "NONE"));
  const guideExceeded = hasAnyOffer && guidePriceCents > 0 && highestOfferCents >= guidePriceCents;

  const sellerName =
    (listing.seller as any)?.username ?? (listing.seller as any)?.name ?? (listing.seller as any)?.email ?? "Seller";

  const descriptionText = String(listing.description ?? "").trim();

  const rawBuyNow = (listing as any).buyNowPrice;
  const buyNowEnabled = Boolean((listing as any).buyNowEnabled);
  const buyNowHasPrice = typeof rawBuyNow === "number";
  const buyNowPriceCents =
    listing.type === "FIXED_PRICE"
      ? (buyNowHasPrice ? (rawBuyNow as number) : guidePriceCents)
      : (buyNowHasPrice ? (rawBuyNow as number) : null);
  // Kevin model:
  // - No Buy Now shown initially on timed offers.
  // - Buy Now may be revealed late-stage (final 24h), seller-controlled by setting buyNowPrice.
  // For FIXED_PRICE, Buy Now remains the primary path.
  const hoursLeft = hoursUntil((listing as any).endsAt);
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

  const buyNowVisible =
    listing.status === "ACTIVE" &&
    !isSeller &&
    (
      // FIXED_PRICE: primary path (fallback to price when buyNowPrice not set)
      (listing.type === "FIXED_PRICE" && guidePriceCents > 0) ||
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
          <Link href="/listings" className="bd-link text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">{String((listing as any)?.title ?? "")}</h1>
        </div>

        <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-6">
          {/* Left column */}
          <div className="sm:col-span-2 space-y-4">
            <ListingImageGallery images={(listing as any).images ?? []} title={String((listing as any)?.title ?? "")} />

            <div className="text-sm text-neutral-600">
              Seller:{" "}
              <Link href={`/seller/${sellerId}`} className="underline">
                {sellerName}
              </Link>
            </div>

            <TrustPanel
              username={sellerName}
              suburb={(listing.seller as any)?.suburb}
              state={(listing.seller as any)?.state}
              joinedAt={(listing.seller as any)?.createdAt}
              activeCount={activeCount}
              soldCount={soldCount}
            />

            <div className="flex gap-2 flex-wrap">
              <Badge>{listing.type === "AUCTION" ? "Timed offers" : "Fixed price"}</Badge>
              <Badge>{listing.category}</Badge>
              <Badge>{listing.condition}</Badge>
            </div>

            <div className="pt-1">
              <div className="text-sm font-extrabold">Description</div>
              <div className="mt-2 rounded-xl border border-black/10 bg-white p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                {descriptionText ? descriptionText : "No description provided."}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <ReportListingButton listingId={(listing as any).id} />

              {isSeller ? <PhotosManager listingId={(listing as any).id} initialImages={(listing as any).images ?? []} /> : null}

              <div>
                {session?.user?.id && session.user.id === (listing as any).sellerId ? null : <MessageSellerButton listingId={(listing as any).id} />}
              </div>

              {session?.user?.id && (isAdmin || (listing as any).sellerId === session.user.id) ? <DeleteListingButton id={(listing as any).id} /> : null}

              {isSeller ? (
                <div>
                  <RelistButton listingId={(listing as any).id} />
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
                      {hasAnyOffer ? formatMoney(highestOfferCents) : "No offers yet"}
                    </div>
                    <div className="text-xs text-neutral-600">Highest offer</div>
                    {(listing as any).bids && (listing as any).bids.length ? (
                      <div className="pt-3">
                        <div className="text-xs text-neutral-600">Offer ladder (top buyers)</div>
                        <div className="mt-2 space-y-1">
                          {(ladderTop as any[]).map((b, idx) => (
                            <div key={`${b.bidderId}-${b.amount}-${idx}`} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${viewerId && b.bidderId === viewerId ? "bg-[var(--bidra-link)]/10" : ""}`}>
                              <div className="text-neutral-600">{viewerId && b.bidderId === viewerId ? "You" : `#${idx + 1}`}</div>
                              <div className="font-semibold text-neutral-900">{formatMoney(b.amount)}</div>
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
                      <div className="text-neutral-900 text-right">{urgencyText ? urgencyText : (isFinalWindow ? "Final 24h" : "In progress")}</div>

                      <div className="text-neutral-600">Interest</div>
                      <div className="text-neutral-900 text-right">{pressure ? "Strong" : (guideExceeded ? "Above guide" : "Normal")}</div>
                    </div>

                    {buyNowVisible ? (
                      <div className="pt-3">
                        <BuyNowButton listingId={(listing as any).id} />
                        <div className="mt-1 text-xs text-neutral-600">Buy Now: {formatMoney(buyNowPriceCents as number)}</div>
                      </div>
                    ) : (
                      <>
                      <div className="pt-3 text-xs text-neutral-600">Buy Now may appear in the final 24 hours.</div>
                      <div className="mt-2 text-xs text-neutral-600">Seller decides whether to accept the highest offer.</div>
                      </>
                    )}
                  </div>
                </div>

                {isSeller ? (
                  <div className="bd-card p-4">
                    <div className="text-sm font-semibold">Seller action</div>
                    <div className="mt-2">
                      {isEnded && hasAnyOffer ? (
                        <AcceptHighestOfferButton listingId={(listing as any).id} />
                      ) : (
                        <div className="text-xs text-neutral-600">
                          You can proceed with the highest offer after the listing ends and at least one offer exists.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bd-card p-4">
                    <div className="text-sm font-semibold">Place an offer</div>
                    <div className="mt-2">
                      <PlaceOfferClient listingId={(listing as any).id} minOfferCents={minOfferCents} offerState={offerState} disabled={isEnded || isSeller} disabledText={isSeller ? "Sellers cannot place offers on their own listing." : "Waiting for seller decision."} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bd-card p-4 space-y-3">
                <div className="text-sm font-semibold">Price</div>
                <div className="text-2xl font-extrabold">{formatMoney(guidePriceCents)}</div>
                {buyNowVisible ? (
                  <div className="space-y-1">
                    <BuyNowButton listingId={(listing as any).id} />
                    <div className="text-xs text-neutral-600">Buy Now: {formatMoney((buyNowPriceCents ?? guidePriceCents) as number)}</div>
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
