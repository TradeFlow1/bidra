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
      className="bd-marketplace-card group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
      aria-label={"View listing " + title}
    >
      <div className="overflow-hidden bg-white">
        <div className="relative aspect-[1/0.86] overflow-hidden bg-[#EEF3FA]">
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
              className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[18px] text-[#0B4DFF] shadow-[0_8px_20px_rgba(28,50,84,0.16)] transition hover:scale-105"
              aria-label="Save listing"
            >
              {watched ? "♥" : "♡"}
            </button>
          ) : null}
        </div>

        <div className="px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
          <div className="text-[15px] font-extrabold tracking-tight text-[#06132B] sm:text-[16px]">
            {money(primaryCents)}
          </div>

          <div
            className="mt-1 line-clamp-2 min-h-[2rem] text-[12px] font-bold leading-4 text-[#14213D] sm:text-[13px]"
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
            className="mt-1.5 truncate text-[11px] font-semibold text-[#607089]"
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





