import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { ProductPlaceholder, placeholderKindFromCategory } from "@/components/marketplace-ui";
import type { BrowseListing } from "./listing-types";

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function getListingImage(listing: BrowseListing) {
  const all = [...(listing.images || []), ...(listing.photos || [])];
  const first = all.find((item) => typeof item === "string" && item.trim().length > 0);
  return first || null;
}

function saleTypeLabel(listing: BrowseListing) {
  if (listing.type === "OFFERABLE") return "Auction";
  return "Buy Now";
}

function suburbLabel(value: string | null | undefined) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Australia";
  const first = raw.split(",")[0]?.trim() || raw;
  return first.replace(/^\d{4}\s+/, "").trim() || raw;
}

function timeRemaining(value: Date | string | null | undefined) {
  if (!value) return "2d 14h";
  const end = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(end.getTime())) return "2d 14h";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Closing soon";
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return "Closing soon";
}

function displayPriceForListing(listing: BrowseListing) {
  const highestOffer = listing.offers?.[0]?.amount ?? null;
  if (listing.type === "OFFERABLE") return highestOffer ?? listing.price ?? listing.buyNowPrice;
  return listing.buyNowPrice ?? listing.price;
}

function HeartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

export function BrowseListingCard({ listing }: { listing: BrowseListing }) {
  const image = getListingImage(listing);
  const price = displayPriceForListing(listing);
  const typeLabel = saleTypeLabel(listing);
  const highestOffer = listing.offers?.[0]?.amount ?? null;
  const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
  const place = suburbLabel(listing.location);

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group block overflow-hidden rounded-[18px] border border-[#E8E2F4] bg-white shadow-[0_14px_38px_rgba(18,7,36,0.08)] transition duration-200 hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_26px_80px_rgba(43,16,85,0.16)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)]">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.045]"
            unoptimized
          />
        ) : (
          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        <div className="absolute left-3 top-3"><Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge></div>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/88 text-[#4C3D63] shadow-sm backdrop-blur transition group-hover:text-[#7C3AED]">
          <HeartIcon className="h-5 w-5" />
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.35rem] text-sm font-black leading-tight tracking-[-0.03em] text-[#120724]">{listing.title}</h3>
        <div className="mt-3">
          <p className="text-[11px] font-bold text-[#6D647A]">{listing.type === "OFFERABLE" ? "Current bid" : "Price"}</p>
          <p className="text-xl font-black tracking-[-0.045em] text-[#120724]">{formatPrice(price)}</p>
          {highestOffer ? <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#7C3AED]">Highest offer {formatPrice(highestOffer)}</p> : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-[#6D647A]">
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><PinIcon /><span className="truncate">{place}</span></span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#E11D48]"><ClockIcon /> {remaining}</span>
        </div>
      </div>
    </Link>
  );
}

export function BrowseListingMobileCard({ listing }: { listing: BrowseListing }) {
  const image = getListingImage(listing);
  const price = displayPriceForListing(listing);
  const typeLabel = saleTypeLabel(listing);
  const highestOffer = listing.offers?.[0]?.amount ?? null;
  const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
  const place = suburbLabel(listing.location);

  return (
    <Link href={"/listings/" + listing.id} className="grid grid-cols-[132px_1fr] overflow-hidden rounded-[20px] border border-[#E8E2F4] bg-white shadow-[0_14px_38px_rgba(18,7,36,0.08)] active:scale-[0.995]">
      <div className="relative min-h-[132px] overflow-hidden bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)]">
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="132px" className="object-cover" unoptimized />
        ) : (
          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
        )}
        <div className="absolute left-2 top-2"><Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge></div>
      </div>

      <div className="min-w-0 p-3.5">
        <h3 className="line-clamp-2 text-sm font-black leading-tight tracking-[-0.02em] text-[#120724]">{listing.title}</h3>
        <p className="mt-2 text-[11px] font-bold text-[#6D647A]">{listing.type === "OFFERABLE" ? "Current bid" : "Price"}</p>
        <p className="text-xl font-black tracking-[-0.045em] text-[#120724]">{formatPrice(price)}</p>
        {highestOffer ? <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.08em] text-[#7C3AED]">Highest offer {formatPrice(highestOffer)}</p> : null}
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-[#6D647A]">
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><PinIcon /><span className="truncate">{place}</span></span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#E11D48]"><ClockIcon /> {remaining}</span>
        </div>
      </div>
    </Link>
  );
}
