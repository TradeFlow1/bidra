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

function timeRemaining(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "Ended";

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainder = hours % 24;

  if (days > 0) return `${days}d ${remainder}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Closing soon";
}

function suburbLabel(value: string | null | undefined) {
  const raw = cleanText(value);
  if (!raw) return "Australia";

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const first = parts[0] || raw;
  return first.replace(/^\d{4}\s+/, "").trim() || raw;
}

function saleTypeText(listing: ListingCardListing) {
  if (listing.type === "OFFERABLE" && typeof listing.buyNowPrice === "number") return "Offers + Buy Now";
  if (listing.type === "OFFERABLE") return "Make Offer";
  return "Buy Now";
}

function sellerTrustCue(seller: any) {
  const cues: string[] = [];
  if (seller?.emailVerified) cues.push("Email verified");
  if (seller?.phoneVerified) cues.push("Phone verified");
  if (seller?.memberSince) cues.push("Established seller");
  return cues[0] || "Seller profile";
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
  const location = suburbLabel(listing.location);
  const saleTypeLabel = saleTypeText(listing);
  const offerCount = Number(listing.offerCount || 0);
  const remaining = timeRemaining(listing.endsAt);
  const sellerName = cleanText(listing.seller?.name || listing.seller?.username || "");
  const trustCue = sellerTrustCue(listing.seller);
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
      className="bd-marketplace-card group block overflow-hidden rounded-[26px] border border-[#EDE9FE] bg-white shadow-[0_16px_46px_rgba(43,16,85,0.07)] transition hover:-translate-y-0.5 hover:border-[#C4B5FD] hover:shadow-[0_24px_70px_rgba(43,16,85,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
      aria-label={"View listing " + title}
    >
      <div className="overflow-hidden bg-white">
        <div className="relative aspect-[1/0.92] overflow-hidden bg-[#FBF9FF]" style={{ position: "relative", aspectRatio: "1 / 0.92", width: "100%", maxWidth: "100%", overflow: "hidden", background: "#FBF9FF" }}>
          {isNoPhotos ? (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_55%,#F5F3FF_100%)] p-6">
              <Image src="/brand/bidra-child-drawing-mark.svg" alt="" width={96} height={96} unoptimized className="h-16 w-16 opacity-80" />
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

          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#5B21B6] shadow-[0_8px_20px_rgba(43,16,85,0.14)] ring-1 ring-[#DDD6FE]">{saleTypeLabel}</span>

          {remaining ? (
            <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full border border-white/80 bg-[#120724]/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(18,7,36,0.18)]">
              {remaining}
            </span>
          ) : null}

          {showWatchButton ? (
            <button
              type="button"
              onClick={onToggleWatch}
              className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[18px] text-[#5B21B6] shadow-[0_8px_20px_rgba(43,16,85,0.16)] transition hover:bg-[#F5F3FF]"
              aria-label="Save listing"
            >
              {watched ? "♥" : "♡"}
            </button>
          ) : null}
        </div>

        <div className="px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
          <div className="text-[16px] font-black tracking-[-0.035em] text-[#120724] sm:text-[17px]">
            {money(primaryCents)}
          </div>

          <div
            className="mt-1 line-clamp-2 min-h-[2rem] text-[12px] font-bold leading-4 text-[#2B1B3A] sm:text-[13px]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as CSSProperties}
          >
            {title}
          </div>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-[#62516F]">
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
            <span className="shrink-0 text-[#8B7A98]">{listedText}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#5B21B6]">
            {listing.type === "OFFERABLE" ? <span className="rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-2 py-1">{offerCount} offers</span> : null}
            {listing.condition ? <span className="rounded-full border border-[#EDE9FE] bg-white px-2 py-1">{cleanText(listing.condition).replace(/_/g, " ")}</span> : null}
          </div>

          <div className="mt-3 border-t border-[#F0EAFE] pt-2.5 text-[11px] font-bold leading-4 text-[#62516F]">
            <span className="line-clamp-1 text-[#3B254F]">{sellerName || "Bidra seller"}</span>
            <span className="mt-0.5 block truncate">{trustCue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}








