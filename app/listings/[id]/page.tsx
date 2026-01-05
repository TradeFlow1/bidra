import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TrustPanel from "@/components/trust/trust-panel";
import PlaceOfferClient from "./place-offer-client";
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

export default async function ListingPage({ params }: { params: { id: string } }) {
    const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      buyNowPrice: true,
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
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
    },
  });

  if (!listing) {
    return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6">Listing not found.</div>
    </main>
  );
  }

  
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
const sellerId = (listing.seller as any)?.id as string;

  const soldCount = await prisma.listing.count({
    where: { sellerId, status: "SOLD" },
  });

  const activeCount = await prisma.listing.count({
    where: { sellerId, status: "ACTIVE" },
  });

    const highestBidCents =
    listing.bids && listing.bids.length ? (listing.bids[0] as any).amount : 0;

  const isAuction = listing.type === "AUCTION";

  // For AUCTION: listing.price is the starting offer (cents). For FIXED_PRICE: listing.price is the fixed price.
  const startOfferCents = isAuction ? listing.price : 0;

  const currentOfferCents = isAuction
    ? Math.max(startOfferCents, highestBidCents)
    : listing.price;

  const reserveMet =
    typeof (listing as any).reservePrice === "number"
      ? currentOfferCents >= (listing as any).reservePrice
      : true;

  const buyNowHasPrice = typeof (listing as any).buyNowPrice === "number";

  // Buy now is valid on FIXED_PRICE always (ACTIVE listing), and on AUCTION only until 85% threshold.
  const buyNowAvailable = buyNowHasPrice
    ? (isAuction
        ? currentOfferCents < Math.floor(((listing as any).buyNowPrice as number) * 0.85)
        : true)
    : false;



  const minBidCents = Math.max(startOfferCents, highestBidCents + 100);

  const sellerName =
    (listing.seller as any)?.username ??
    (listing.seller as any)?.name ??
    (listing.seller as any)?.email ??
    "Seller";

  const descriptionText = String(listing.description ?? "").trim();
return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-5 space-y-4">
      <Link href="/listings" className="bd-link text-sm">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold">{listing.title}</h1>

      <ListingImageGallery images={(listing as any).images ?? (listing as any).imageUrls ?? (listing as any).photos ?? []} title={listing.title} />

      <div className="text-sm text-neutral-600">
        Seller:{" "}
        <Link href={`/seller/${sellerId}`} className="underline">
          {sellerName}
        </Link>
      </div>

      {/* Trust signals (honest + verifiable) */}
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

      <div className="text-lg font-semibold">
  {listing.type === "AUCTION" ? (
    <>
      Top offer: {formatMoney(currentOfferCents)}
       {buyNowAvailable ? (
         <div className="mt-3">
           <BuyNowButton listingId={listing.id} />
         </div>
       ) : null}
            {typeof (listing as any).buyNowPrice === "number" ? (
        buyNowAvailable ? (
          <span className="ml-2 text-sm text-neutral-600">
            • Buy now {formatMoney((listing as any).buyNowPrice)}
          </span>
        ) : (
          <span className="ml-2 text-sm text-neutral-500">
            • Buy now reached
          </span>
        )
      ) : null}
    </>
  ) : (
    <>Price: {formatMoney(listing.price)}{buyNowAvailable ? (<div className="mt-3"><BuyNowButton listingId={listing.id} /></div>) : null}</>
  )}
</div>

      <div className="pt-3">
        <div className="text-sm font-extrabold">Description</div>
        <div className="mt-2 rounded-xl border border-black/10 bg-white p-4 text-sm text-neutral-800 whitespace-pre-wrap">
          {descriptionText ? descriptionText : "No description provided."}
        </div>
      </div>


      {listing.type === "AUCTION" ? (
        <PlaceOfferClient listingId={listing.id} minOfferCents={minBidCents} />
      ) : (
        <div className="text-sm text-neutral-600">
          <div className="space-y-3">
            <BuyNowButton listingId={listing.id} />
            <div className="text-sm text-neutral-600">
              Offers are only available on eligible listings.
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <ReportListingButton listingId={listing.id} />
        
        <div className="mt-3">
          {(session?.user?.id && session.user.id === listing.sellerId) ? null : (
            <MessageSellerButton listingId={listing.id} />
          )}
        </div>
{
        (session?.user?.id && (isAdmin || listing.sellerId === session.user.id)) ? (
          <DeleteListingButton id={listing.id} />
        ) : null
      }
      </div>
      </div>
    </main>
  );
}
