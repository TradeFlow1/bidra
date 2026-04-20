"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import ListingThumbCarousel from "@/components/listing-thumb-carousel";
import { isTimedOffersType } from "@/lib/listing-type";
import { formatTimeRemaining } from "@/lib/time-remaining";

type ListingCardListing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
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
  return "Ends in " + t;
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function shortCategory(value: string | null | undefined) {
  const v = cleanText(value);
  if (!v) return "";
  if (v.indexOf(" > ") >= 0) return v.split(" > ").pop() || v;
  if (v.indexOf(" › ") >= 0) return v.split(" › ").pop() || v;
  return v;
}

function shortCondition(value: string | null | undefined) {
  const v = cleanText(value);
  if (!v) return "";
  return v.replaceAll("_", " ");
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

  const primaryCents = isTimedOffers
    ? Number(listing.price)
    : (hasBuyNow ? (listing.buyNowPrice as number) : Number(listing.price));

  const isActive = String(listing.status || "ACTIVE") === "ACTIVE";
  const ends = isTimedOffers && isActive ? endsLabel(listing.endsAt) : null;

  const title = cleanText(listing.title);
  const category = shortCategory(listing.category);
  const condition = shortCondition(listing.condition);
  const location = cleanText(listing.location);

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group block overflow-hidden rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EEF2F7]">
        {hasMulti ? (
          <ListingThumbCarousel images={listing.images} title={title} />
        ) : (
          <>
            <Image
              src={fallback}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1400px) 33vw, 25vw"
              className={isNoPhotos ? "select-none object-contain p-10 opacity-90" : "select-none object-cover transition duration-300 group-hover:scale-[1.02]"}
              draggable={false}
              onDragStart={function (e) { e.preventDefault(); }}
              onContextMenu={function (e) { e.preventDefault(); }}
              style={{ userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
              unoptimized
            />

            {isNoPhotos ? (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-black/10 bg-white/96 px-3 py-1 text-[11px] font-semibold tracking-tight text-neutral-700 shadow-sm">
                Photo coming soon
              </div>
            ) : null}
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className={isTimedOffers
            ? "rounded-full border border-amber-200 bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-sm"
            : hasBuyNow
            ? "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm"
            : "rounded-full border border-black/10 bg-white/96 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm"
          }>
            {isTimedOffers ? "Offers" : hasBuyNow ? "Buy Now" : "Fixed"}
          </span>
          {ends ? (
            <span className="rounded-full bg-black/78 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {ends}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#475569]">
            {category ? <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1">{category}</span> : null}
            {condition ? <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1">{condition}</span> : null}
          </div>

          <div
            className="text-[17px] font-bold leading-snug text-[#0F172A] line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties}
          >
            {title}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Top offer" : "Price"}</div>
          <div className="mt-1 text-[24px] font-extrabold tracking-tight text-[#0F172A]">{money(primaryCents)}</div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="min-w-0 truncate">{location || "Location on request"}</div>
          <div className="font-semibold text-[#0F172A]">{isTimedOffers ? "View" : "View"}</div>
        </div>
      </div>
    </Link>
  );
}