"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ListingThumbCarousel from "@/components/listing-thumb-carousel";

type ListingLite = {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | null;        // cents
  buyNowPrice?: number | null;  // cents
  type?: string | null;         // "FIXED_PRICE" | "AUCTION" | etc
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: any[] | string[] | null;
};

function moneyFromCents(n?: number | null) {
  if (n === null || n === undefined) return "";
  const dollars = (n / 100).toFixed(2);
  return `$${dollars} AUD`;
}

function typeLabel(t?: string | null) {
  const x = (t || "").toUpperCase();
  if (x === "AUCTION") return "Auction";
  if (x === "FIXED_PRICE") return "Fixed price";
  return x ? x.replace(/_/g, " ").toLowerCase() : "Listing";
}

export default function ListingCard({
  listing,
  initiallyWatched,
}: {
  listing: ListingLite;
  initiallyWatched?: boolean;
}) {
  const [watched, setWatched] = useState<boolean>(!!initiallyWatched);

  const title = useMemo(() => (listing.title || "Listing").trim(), [listing.title]);
  const meta = useMemo(
    () => [listing.category, listing.location].filter(Boolean).join(" • "),
    [listing.category, listing.location]
  );

  const price = moneyFromCents(listing.price);
  const chip = typeLabel(listing.type);

  async function toggleWatch(e: any) {
    // don't navigate when clicking watch
    e.preventDefault();
    e.stopPropagation();

    const next = !watched;
    setWatched(next);

    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });

      if (!res.ok) {
        setWatched((v) => !v); // revert
      }
    } catch {
      setWatched((v) => !v); // revert
    }
  }

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group block w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Image */}
      <div className="relative w-full bg-gray-100 overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <div className="relative h-full w-full">
          <ListingThumbCarousel images={listing.images} title={title} />
        </div>

        {/* Chip */}
        <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white">
          {chip}
        </div>

        {/* Watch (optional) */}
        <button
          type="button"
          onClick={toggleWatch}
          className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white hover:bg-black/85"
          aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
          title={watched ? "Watching" : "Watch"}
        >
          {watched ? "♥" : "♡"}
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="text-lg font-semibold leading-snug text-gray-900 line-clamp-2">{title}</div>

        {meta ? (
          <div className="mt-1 text-xs text-gray-600 line-clamp-1">{meta}</div>
        ) : (
          <div className="mt-1 text-xs text-gray-600">&nbsp;</div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-bold text-gray-900">{price}</div>
          {listing.condition ? (
            <div className="text-[10px] rounded-full border px-2 py-1 text-gray-700">
              {String(listing.condition).replace(/_/g, " ")}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
