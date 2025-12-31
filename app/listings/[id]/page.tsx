import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TrustPanel from "@/components/trust/trust-panel";
import PlaceBidClient from "./place-bid-client";
import DeleteListingButton from "./delete-listing-button";
import ReportListingButton from "./report-listing-button";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)} AUD`;
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: true,
      bids: { orderBy: { amount: "desc" }, take: 1 },
    },
  });

  if (!listing) {
    return <div className="max-w-xl">Listing not found.</div>;
  }

  const sellerId = (listing.seller as any)?.id as string;

  const soldCount = await prisma.listing.count({
    where: { sellerId, status: "SOLD" },
  });

  const activeCount = await prisma.listing.count({
    where: { sellerId, status: "ACTIVE" },
  });

  const highestBidCents =
    listing.bids && listing.bids.length ? (listing.bids[0] as any).amount : 0;


  const currentBidCents = Math.max(listing.price, highestBidCents);

  const reserveMet =
    typeof (listing as any).reservePrice === "number"
      ? currentBidCents >= (listing as any).reservePrice
      : true;

  const buyNowAvailable =
    typeof (listing as any).buyNowPrice === "number"
      ? currentBidCents < (listing as any).buyNowPrice
      : false;

  const minBidCents = Math.max(listing.price, highestBidCents + 100);

  const sellerName =
    (listing.seller as any)?.username ??
    (listing.seller as any)?.name ??
    (listing.seller as any)?.email ??
    "Seller";

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/listings" className="text-sm underline">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold">{listing.title}</h1>

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
        <Badge>{listing.type === "AUCTION" ? "Offers" : "Fixed price"}</Badge>
        <Badge>{listing.category}</Badge>
        <Badge>{listing.condition}</Badge>
      </div>

      <div className="text-lg font-semibold">
  {listing.type === "AUCTION" ? (
    <>
      Top offer: {formatMoney(currentBidCents)}
      {typeof (listing as any).buyNowPrice === "number" && buyNowAvailable ? (
        <span className="ml-2 text-sm text-neutral-600">
          • Buy now {formatMoney((listing as any).buyNowPrice)}
        </span>
      ) : null}
    </>
  ) : (
    <>Price: {formatMoney(listing.price)}</>
  )}
</div>

      {listing.type === "AUCTION" ? (
        <PlaceBidClient listingId={listing.id} minBidCents={minBidCents} />
      ) : (
        <div className="text-sm text-neutral-600">
          Offers are only available on eligible listings.
        </div>
      )}

      <div className="pt-4">
        <ReportListingButton listingId={listing.id} />
        <DeleteListingButton id={listing.id} />
      </div>
    </div>
  );
}
