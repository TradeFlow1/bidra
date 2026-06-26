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
  createdAt?: string | Date | null;
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

function stableListedDate(value: string | Date | null | undefined) {
  if (!value) return "Listed recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Listed recently";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getUTCMonth()] || "Jan";
  return "Listed " + day + " " + month;
}

function relativeTime(value: string | Date | null | undefined) {
  if (!value) return "Listed recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Listed recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 14) return days + "d ago";
  return stableListedDate(value);
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
    "/brand/bidra-child-drawing-mark.svg";

  const primaryCents = Number(listing.price);

  const title = cleanText(listing.title);
  const location = cleanText(listing.location);
  const saleTypeLabel = listing.type === "OFFERABLE" ? "Make offer" : "Buy now";
  const [listedText, setListedText] = useState(function () {
    return stableListedDate(listing.createdAt);
  });

  useEffect(() => {
    setListedText(relativeTime(listing.createdAt));
  }, [listing.createdAt]);

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
      className="bd-marketplace-card group block overflow-hidden rounded-[24px] border border-[#D8E6F8] bg-white shadow-sm transition hover:border-[#AFC8F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
      aria-label={"View listing " + title}
    >
      <div className="overflow-hidden bg-white">
        <div className="relative aspect-[1/0.92] overflow-hidden bg-[#EEF3FA]" style={{ position: "relative", aspectRatio: "1 / 0.92", width: "100%", maxWidth: "100%", overflow: "hidden", background: "#EEF3FA" }}>
          {isNoPhotos ? (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_55%,#F5F3FF_100%)] p-6">
              <Image src="/brand/bidra-child-drawing-mark.svg" alt="" width={96} height={96} unoptimized className="h-16 w-16 opacity-75" />
            </div>
          ) : (
            <Image
              src={fallback}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1400px) 25vw, 20vw"
              className="object-cover transition duration-300"
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
          )}

          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/80 bg-[#0E7490] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(28,50,84,0.14)]">{saleTypeLabel}</span>

          {showWatchButton ? (
            <button
              type="button"
              onClick={onToggleWatch}
              className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[18px] text-[#0E7490] shadow-[0_8px_20px_rgba(28,50,84,0.16)] transition"
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

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-[#607089]">
            <span
              className="min-w-0 truncate"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as CSSProperties}
            >
              {location || "Australia"}
            </span>
            <span className="shrink-0 text-[#8190A7]">{listedText}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}








