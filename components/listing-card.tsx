"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ProductPlaceholder,
  MarketplaceIcon,
} from "@/components/marketplace-ui";

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
    currency: "AUD",
  });
}

function cleanText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function relativeTime(value: string | Date | null | undefined) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 14) return days + "d ago";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function placeholderKind(category: string, title: string) {
  const haystack = (category + " " + title).toLowerCase();
  if (/sofa|couch|lounge|chair|furniture/.test(haystack)) return "sofa";
  if (/bike|bicycle|cycling/.test(haystack)) return "bicycle";
  if (/headphone|audio|speaker|earbud/.test(haystack)) return "headphones";
  if (/camera|lens|photo/.test(haystack)) return "camera";
  if (/phone|iphone|android|mobile/.test(haystack)) return "phone";
  if (/laptop|computer|macbook|electronics|tablet/.test(haystack))
    return "laptop";
  if (/coffee|espresso|machine|appliance/.test(haystack))
    return "coffee-machine";
  return "generic";
}

function sellerSignal(seller: any) {
  if (!seller) return "Seller signals";
  if (seller.emailVerified || seller.phone) return "Account signals";
  if (seller.memberSince) return "Local seller";
  return "Seller signals";
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
    "/brand/bidra-symbol.svg";

  const primaryCents = Number(listing.price);

  const title = cleanText(listing.title);
  const category = cleanText(listing.category);
  const location = cleanText(listing.location);
  const saleTypeLabel = listing.type === "OFFERABLE" ? "Make offer" : "Buy now";
  const listedText = relativeTime(listing.createdAt);
  const trustCue = sellerSignal(listing.seller);

  async function onToggleWatch(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!viewerAuthed) {
      router.push(
        "/auth/login?next=" + encodeURIComponent("/listings/" + listing.id),
      );
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
      className="bd-marketplace-card group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
      aria-label={"View listing " + title}
    >
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF3FA]">
          {isNoPhotos ? (
            <ProductPlaceholder
              kind={placeholderKind(category, title)}
              title={title || "Bidra listing"}
            />
          ) : (
            <Image
              src={fallback}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1400px) 25vw, 20vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              draggable={false}
              onDragStart={function (e) {
                e.preventDefault();
              }}
              onContextMenu={function (e) {
                e.preventDefault();
              }}
              style={
                {
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitUserDrag: "none",
                } as CSSProperties
              }
            />
          )}

          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#06132B] shadow-[0_8px_20px_rgba(28,50,84,0.14)]">
            {saleTypeLabel}
          </span>

          {showWatchButton ? (
            <button
              type="button"
              onClick={onToggleWatch}
              className="absolute right-2.5 top-2.5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[18px] text-[#0B4DFF] shadow-[0_8px_20px_rgba(28,50,84,0.16)] transition hover:scale-105"
              aria-label="Save listing"
            >
              {watched ? "♥" : "♡"}
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
          <div className="text-[15px] font-extrabold tracking-tight text-[#06132B] sm:text-[16px]">
            {money(primaryCents)}
          </div>

          <div
            className="mt-1 line-clamp-2 min-h-[2rem] text-[12px] font-bold leading-4 text-[#14213D] sm:text-[13px]"
            style={
              {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as CSSProperties
            }
          >
            {title}
          </div>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-[#607089]">
            <span
              className="min-w-0 truncate"
              style={
                {
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                } as CSSProperties
              }
            >
              {location || "Australia"}
            </span>
            <span className="shrink-0 text-[#8190A7]">{listedText}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-[#EEF2F8] pt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#6B7A92]">
            <MarketplaceIcon
              name="safe"
              className="h-3.5 w-3.5 text-[#0B4DFF]"
            />
            <span className="truncate">{trustCue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
