"use client";

import Link from "next/link";
import React from "react";
import ListingThumbCarousel from "@/components/listing-thumb-carousel";

type ListingCardListing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
  type?: string;
  category?: string;
  condition?: string | null;
  images?: any;
  location?: string | null;
};

type ListingCardProps = {
  listing: ListingCardListing;
  initiallyWatched?: boolean;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const imgs = Array.isArray(listing.images) ? listing.images : null;
  const hasMulti = !!(imgs && imgs.length > 1);

  const fallback =
    (imgs && imgs.length > 0 && (imgs[0]?.url || imgs[0]?.src || imgs[0])) ||
    "/brand/icon/bidra-icon_dark.png";

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
              className="h-full w-full select-none object-cover"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" } as any }
            />

            {!imgs || imgs.length === 0 ? (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                Photos coming soon
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <div className="/* STEP3_TITLE_BUMP */ text-[17px] font-extrabold leading-snug text-[#0b1220] line-clamp-2">
          {listing.title}
        </div>

        <div className="text-[14px] font-black text-[#0b1220]">
          {"A$" + listing.price.toLocaleString()}
        </div>

        {listing.location ? (
          <div className="text-xs font-medium text-black/55">{listing.location}</div>
        ) : (
          <div className="text-xs text-transparent">.</div>
        )}
      </div>
    </Link>
  );
}
