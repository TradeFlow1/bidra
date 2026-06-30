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
  const conditionLabel = listing.condition ? String(listing.condition).replace(/_/g, " ").trim() : "Premium condition";

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#E8E2F4] bg-[linear-gradient(180deg,#ffffff_0%,#fcf9ff_100%)] shadow-[0_20px_70px_rgba(18,7,36,0.08)] transition duration-200 hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_30px_95px_rgba(43,16,85,0.16)]"
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

        <div className="absolute inset-0 bg-gradient-to-t from-[#120724]/80 via-[#120724]/15 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge>
          <span className="rounded-full border border-white/20 bg-white/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5B21B6] backdrop-blur">
            {listing.category || "Premium listing"}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
            {remaining}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#5B21B6] shadow-sm transition group-hover:scale-105">
            <HeartIcon className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">{place}</p>
            <h3 className="mt-2 line-clamp-2 min-h-[2.7rem] text-[15px] font-black leading-tight tracking-[-0.03em] text-[#120724]">{listing.title}</h3>
          </div>
          <div className="rounded-[16px] border border-[#E8E2F4] bg-[#FBFAFF] px-3 py-2 text-right shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8B7A98]">Price</p>
            <p className="mt-1 text-base font-black text-[#120724]">{formatPrice(price)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#E8E2F4] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5B21B6]">
            {conditionLabel}
          </span>
          {highestOffer ? (
            <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7C3AED]">
              Best offer {formatPrice(highestOffer)}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0EAFE] pt-3 text-[11px] font-bold text-[#62516F]">
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><PinIcon /><span className="truncate">{place}</span></span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#E11D48]"><ClockIcon /> {remaining}</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#5B21B6]">
          <span>View listing</span>
          <span aria-hidden="true">↗</span>
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
  const conditionLabel = listing.condition ? String(listing.condition).replace(/_/g, " ").trim() : "Premium condition";

  return (
    <Link href={"/listings/" + listing.id} className="overflow-hidden rounded-[24px] border border-[#E8E2F4] bg-[linear-gradient(180deg,#ffffff_0%,#fcf9ff_100%)] shadow-[0_16px_42px_rgba(18,7,36,0.08)] active:scale-[0.995]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)]">
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="100vw" className="object-cover" unoptimized />
        ) : (
          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120724]/70 via-[#120724]/10 to-transparent" />
        <div className="absolute left-2.5 top-2.5"><Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge></div>
        <div className="absolute bottom-2.5 left-2.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          {remaining}
        </div>
      </div>

      <div className="min-w-0 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-black leading-tight tracking-[-0.02em] text-[#120724]">{listing.title}</h3>
          <div className="rounded-[14px] border border-[#E8E2F4] bg-[#FBFAFF] px-2.5 py-1.5 text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8B7A98]">Price</p>
            <p className="mt-0.5 text-sm font-black text-[#120724]">{formatPrice(price)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#E8E2F4] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5B21B6]">
            {conditionLabel}
          </span>
          {highestOffer ? <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7C3AED]">Best offer</span> : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-[#6D647A]">
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><PinIcon /><span className="truncate">{place}</span></span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#E11D48]"><ClockIcon /> {remaining}</span>
        </div>
      </div>
    </Link>
  );
}
