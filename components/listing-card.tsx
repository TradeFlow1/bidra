"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

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
  offerCount?: number | null;
  currentOffer?: number | null;
  seller?: any;
};

type ListingCardProps = {
  listing: ListingCardListing;
  initiallyWatched?: boolean;
  viewerAuthed?: boolean;
  showWatchButton?: boolean;
};

function money(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD"
  });
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export default function ListingCard({
  listing,
  initiallyWatched = false,
  viewerAuthed = false,
  showWatchButton = false,
}: ListingCardProps) {
  const router = useRouter();

  const [watched, setWatched] = useState<boolean>(!!initiallyWatched);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setWatched(!!initiallyWatched);
  }, [initiallyWatched]);

  const imgs = Array.isArray(listing.images) ? listing.images : null;

  const isNoPhotos = !imgs || imgs.length === 0;

  const fallback =
    (imgs && imgs.length > 0 && (imgs[0]?.url || imgs[0]?.src || imgs[0])) ||
    "/brand/bidra-kangaroo-icon.png";

  const primaryCents = Number(listing.price);

  const title = cleanText(listing.title);
  const location = cleanText(listing.location);

  async function onToggleWatch(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!viewerAuthed) {
      router.push("/auth/login?next=" + encodeURIComponent("/listings/" + listing.id));
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });

      if (res.ok) {
        setWatched(function (v) {
          return !v;
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group block rounded-xl border border-[#D8E1F0] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#AFC3DD] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
      aria-label={"View listing " + title}
    >
      <div className="overflow-hidden rounded-xl bg-white">
        <div className="relative aspect-[1/0.9] overflow-hidden rounded-t-2xl border-b border-[#E5E7EB] bg-[#F1F5F9]">
          <Image
            src={fallback}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1400px) 25vw, 20vw"
            className={isNoPhotos ? "object-cover p-0 opacity-100" : "object-cover transition duration-300 group-hover:scale-[1.02]"}
            draggable={false}
            onDragStart={function (e) {
              e.preventDefault();
            }}
            onContextMenu={function (e) {
              e.preventDefault();
            }}
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitUserDrag: "none"
            } as CSSProperties}
          />

          {showWatchButton ? (
            <button
              type="button"
              onClick={onToggleWatch}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[18px] shadow-sm transition hover:scale-105"
              aria-label="Save listing"
            >
              {watched ? "♥" : "♡"}
            </button>
          ) : null}
        </div>

        <div className="px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2">
          <div className="text-[15px] font-extrabold tracking-tight text-[#0F172A] sm:text-[17px]">
            {money(primaryCents)}
          </div>

          <div
            className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[15px] text-[#111827] sm:text-[13px] sm:leading-4"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as CSSProperties}
          >
            {title}
          </div>

          <div
            className="mt-1 truncate text-[10px] font-medium text-[#64748B] sm:text-[11px] mt-1"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as CSSProperties}
          >
            {location || "Australia"}
          </div>
        </div>
      </div>
    </Link>
  );
}





