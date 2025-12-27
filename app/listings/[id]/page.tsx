import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PlaceBidClient from "./place-bid-client";
import DeleteListingButton from "./delete-listing-button";
import ReportListingButton from "./report-listing-button";

export const dynamic = "force-dynamic";

function formatMoney(cents: number) {
  const dollars = (cents || 0) / 100;
  return dollars.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function typeLabel(t: string) {
  if (t === "AUCTION") return "Auction";
  if (t === "FIXED_PRICE") return "Fixed price";
  if (t === "BUY_NOW") return "Fixed price"; // legacy
  return t || "Unknown";
}

function formatEndsAt(d: Date) {
  return d.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "Ended";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { returnTo?: string };
}) {
  const returnTo = typeof searchParams?.returnTo === "string" ? searchParams.returnTo : "";
  const backHref = returnTo && returnTo.startsWith("/") ? returnTo : "/listings";

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: true,
      bids: { orderBy: { createdAt: "desc" }, take: 20, include: { bidder: true } },
    },
  });

  if (!listing) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Link href={backHref} style={{ textDecoration: "underline" }}>
          &lt; Back
        </Link>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Listing not found</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            This item may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const highestBid = (listing.bids ?? []).reduce((max: any, b: any) => {
    const amt = Number((b as any).amount ?? 0);
    return amt > max ? amt : max;
  }, 0);

  const isAuction = listing.type === "AUCTION";
  const base = isAuction ? (highestBid > 0 ? highestBid : Number(listing.price ?? 0)) : Number(listing.price ?? 0);

  const minBidCents = (Number(base) || 0) + 1;

  const reserve = (listing as any).reservePrice as number | null | undefined;
  const buyNow = (listing as any).buyNowPrice as number | null | undefined;

  const now = new Date();
  const endsAt = listing.endsAt ? new Date(listing.endsAt) : null;
  const ended = isAuction && endsAt ? endsAt.getTime() <= now.getTime() : false;
  const remaining = isAuction && endsAt ? formatRemaining(endsAt.getTime() - now.getTime()) : null;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href={backHref} style={{ textDecoration: "underline" }}>
          &lt; Back
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <DeleteListingButton id={listing.id} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 280 }}>
              <h1 style={{ fontSize: 34, fontWeight: 950, margin: 0 }}>{listing.title}</h1>

              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span>
                  Seller: <b>{listing.seller?.name ?? "Unknown"}</b>
                </span>
                <span> - </span>
                <span>{listing.location ?? "Australia"}</span>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.9 }}>
                  {typeLabel(String(listing.type))}
                </span>
                {listing.category ? (
                  <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.9 }}>
                    {listing.category}
                  </span>
                ) : null}
                {listing.condition ? (
                  <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.9 }}>
                    {listing.condition}
                  </span>
                ) : null}
              </div>

              {isAuction ? (
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Ends</div>
                    <div style={{ marginTop: 4, fontWeight: 900 }}>{endsAt ? formatEndsAt(endsAt) : "Not set"}</div>
                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>{remaining ?? ""}</div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Reserve</div>
                    <div style={{ marginTop: 4, fontWeight: 900 }}>{reserve ? formatMoney(reserve) : "None"}</div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Buy Now</div>
                    <div style={{ marginTop: 4, fontWeight: 900 }}>{buyNow ? formatMoney(buyNow) : "Not set"}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, minWidth: 200, textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{isAuction ? (highestBid > 0 ? "Current bid" : "Starting price") : "Price"}</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 950 }}>{formatMoney(Number(base) || 0)}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>Description</div>
            <p style={{ marginTop: 8, whiteSpace: "pre-wrap", opacity: 0.9 }}>{listing.description || "No description provided."}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <ReportListingButton listingId={listing.id} />

          {isAuction ? (
            ended ? (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 950 }}>Auction ended</div>
                <div style={{ marginTop: 6, opacity: 0.85 }}>Bidding is closed.</div>
              </div>
            ) : (
              <div style={{ border: "2px solid #2563eb", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 950 }}>Place a bid</div>
                <div style={{ marginTop: 10 }}>
                  <PlaceBidClient listingId={listing.id} minBidCents={minBidCents} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                  Anti-sniping can extend the end time when bids are placed near the end.
                </div>
              </div>
            )
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 950 }}>Fixed price listing</div>
              <div style={{ marginTop: 6, opacity: 0.85 }}>Bidding is disabled for fixed price items.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}