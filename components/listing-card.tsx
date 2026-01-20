"use client";

import Link from "next/link";
import React from "react";
import ListingThumbCarousel from "@/components/listing-thumb-carousel";
import { isTimedOffersType } from "@/lib/listing-type";

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
  if (!endsAt) return null;

  const d = endsAt instanceof Date ? endsAt : new Date(String(endsAt));
  const ms = d.getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Ended";

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const rem = totalSec - days * 86400;
  const hours = Math.floor(rem / 3600);
  const mins = Math.floor((rem - hours * 3600) / 60);

  if (days >= 1) return `Ends in ${days}d ${hours}h`;
  if (hours >= 1) return `Ends in ${hours}h ${String(mins).padStart(2, "0")}m`;
  return `Ends in ${Math.max(1, mins)}m`;
}

export default function ListingCard({ listing }: ListingCardProps) {
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
        {hasMulti ? (
          <ListingThumbCarousel images={listing.images} title={listing.title} />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fallback}
              alt={listing.title}
              className={isNoPhotos ? "h-full w-full select-none object-contain p-10 opacity-90" : "h-full w-full select-none object-cover"}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" } as any}
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
        <div className="/* STEP3_TITLE_BUMP */ text-[20px] font-extrabold leading-snug text-[#0b1220] line-clamp-2">
          {listing.title}
        </div>

        <div className="mb-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
            {badge}
          </span>
        </div>

        <div className="text-[14px] font-black text-[#0b1220]">
          {isTimedOffers ? (
            <span>Top offer: {money(primaryCents)}</span>
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
