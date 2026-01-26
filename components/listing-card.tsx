"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import ListingThumbCarousel from "@/components/listing-thumb-carousel";
import WatchButton from "@/components/watch-button";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";

type ListingCardListing = {
  id: string;
  title: string;
  description?: string | null;
  price: number; // cents (for fixed) OR current top offer cents (for timed offers) based on caller mapping
  buyNowPrice?: number | null; // cents
  type?: string;
  category?: string;
  condition?: string | null;
  location?: string | null;
  images?: any;
  endsAt?: string | Date | null;
  status?: string | null;
};

type ListingCardProps = {
  listing: ListingCardListing;
  initiallyWatched?: boolean;
};

function money(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function endsLabel(endsAt: any) {
  const t = formatTimeRemaining(endsAt);
  if (!t) return null;
  if (t === "Ended") return "Ended";
  return `Ends in ${t}`;
}

export default function ListingCard({ listing, initiallyWatched }: ListingCardProps) {
  const imgs = Array.isArray(listing.images) ? listing.images : null;
  const hasMulti = !!(imgs && imgs.length > 1);

  const isNoPhotos = !imgs || imgs.length === 0;
  const fallback =
    (imgs && imgs.length > 0 && (imgs[0]?.url || imgs[0]?.src || imgs[0])) ||
    "/brand/bidra-kangaroo-icon.png";

  const isTimedOffers = isTimedOffersType(listing.type);
  const hasBuyNow = typeof listing.buyNowPrice === "number";

  const badge = isTimedOffers ? "⏳ Timed offers" : hasBuyNow ? "⚡ Buy Now" : "🏷️ Fixed price";

  // Primary price:
  // - Timed offers: listing.price is already mapped as current top offer cents (see app/listings/page.tsx mapping)
  // - Fixed: show buyNowPrice if present else listing.price
  const primaryCents = isTimedOffers ? Number(listing.price) : (hasBuyNow ? (listing.buyNowPrice as number) : Number(listing.price));

  const isActive = String(listing.status || "ACTIVE") === "ACTIVE";
  const ends = isTimedOffers && isActive ? endsLabel(listing.endsAt) : null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full bg-neutral-100">
        <div
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <WatchButton listingId={listing.id} initialWatched={initiallyWatched} compact />
        </div>
        {hasMulti ? (
          <ListingThumbCarousel images={listing.images} title={String((listing as any)?.title ?? (listing as any)?.title ?? "").replace(/\s+/g, " ").trim()} />
        ) : (
          <>
            <Image
              src={fallback}
              alt={String((listing as any)?.title ?? (listing as any)?.title ?? "").replace(/\s+/g, " ").trim()}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className={isNoPhotos ? "select-none object-contain p-10 opacity-90" : "select-none object-cover"}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" } as any}
              unoptimized
            />

            {isNoPhotos ? (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-tight text-white shadow-sm">
                No photos yet
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <div
          className="/* STEP3_TITLE_BUMP */ text-[20px] font-extrabold leading-snug text-[#0b1220] line-clamp-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          } as any}
        >
          {String((listing as any)?.title ?? "").replace(/\s+/g, " ").trim()}
        </div>

        <div className="mb-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
            {badge}
          </span>
        </div>

        <div className="text-[14px] font-black text-[#0b1220]">
          {isTimedOffers ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[12px] font-extrabold text-amber-950">
              <span className="opacity-80">Top offer</span>
              <span aria-hidden="true">•</span>
              <span>{money(primaryCents)}</span>
            </span>
          ) : (
            <span>{money(primaryCents)}</span>
          )}
        </div>

        {ends ? (
          <div className="text-[12px] font-semibold text-black/60">{ends}</div>
        ) : null}

        {listing.location ? (
          <div className="text-xs font-medium text-black/55">{listing.location}</div>
        ) : (
          <div className="text-xs text-transparent">.</div>
        )}
      </div>
    </Link>
  );
}
