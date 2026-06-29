import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { ProductPlaceholder, placeholderKindFromCategory } from "@/components/marketplace-ui";
import type { BrowseListing } from "./listing-types";

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function formatAge(date: Date) {
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) return Math.max(1, Math.floor(diff / minute)) + "m ago";
  if (diff < day) return Math.floor(diff / hour) + "h ago";
  return Math.floor(diff / day) + "d ago";
}

function getListingImage(listing: BrowseListing) {
  const all = [...(listing.images || []), ...(listing.photos || [])];
  const first = all.find((item) => typeof item === "string" && item.trim().length > 0);
  return first || null;
}

function saleTypeLabel(listing: BrowseListing) {
  if (listing.type === "OFFERABLE") return listing.buyNowPrice ? "Offers + Buy Now" : "Offers";
  return "Buy Now";
}

function handoverLabel(value: string | null | undefined) {
  const raw = String(value || "").toUpperCase();
  if (raw === "POSTAGE") return "Postage";
  if (raw === "DELIVERY") return "Delivery";
  return "Pickup";
}

function suburbLabel(value: string | null | undefined) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Australia";
  const first = raw.split(",")[0]?.trim() || raw;
  return first.replace(/^\d{4}\s+/, "").trim() || raw;
}

function timeRemaining(value: Date | string | null | undefined) {
  if (!value) return "";
  const end = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(end.getTime())) return "";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "Closing soon";
}

function sellerTrustLabel(seller: BrowseListing["seller"]) {
  if (seller?.emailVerified && seller?.phoneVerified) return "Verified seller";
  if (seller?.emailVerified || seller?.phoneVerified) return "Verified profile";
  if (seller?.createdAt) return "Seller profile";
  return "Bidra seller";
}

function HeartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function BrowseListingCard({ listing }: { listing: BrowseListing }) {
  const image = getListingImage(listing);
  const price = listing.buyNowPrice ?? listing.price;
  const typeLabel = saleTypeLabel(listing);
  const handover = handoverLabel(listing.fulfillmentType);
  const offerCount = listing._count?.offers ?? 0;
  const highestOffer = listing.offers?.[0]?.amount ?? null;
  const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
  const sellerName = listing.seller?.name || listing.seller?.username || "Bidra seller";
  const trustLabel = sellerTrustLabel(listing.seller);
  const place = suburbLabel(listing.location);

  return (
    <Link
      href={"/listings/" + listing.id}
      className="group block overflow-hidden rounded-[28px] border border-[var(--bd-border)] bg-white shadow-[0_18px_55px_rgba(43,16,85,0.08)] transition duration-200 hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_30px_90px_rgba(43,16,85,0.16)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
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

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge>
          {listing.buyNowPrice && listing.type === "OFFERABLE" ? <Badge tone="neutral">Flexible deal</Badge> : null}
        </div>

        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[var(--bd-purple-dark)] shadow-sm">
          <HeartIcon />
        </span>

        {remaining ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#120724]/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.10em] text-white shadow-sm">
            {remaining}
          </span>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.04em] text-[var(--bd-ink)]">{listing.title}</h3>
        <div className="mt-3">
          <p className="text-xl font-black tracking-[-0.045em] text-[var(--bd-ink)]">{formatPrice(price)}</p>
          {listing.type === "OFFERABLE" && highestOffer ? (
            <p className="mt-1 text-xs font-black uppercase tracking-[0.10em] text-[var(--bd-purple-dark)]">Highest offer {formatPrice(highestOffer)}</p>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[var(--bd-purple-dark)]">
          <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{handover}</span>
          {listing.condition ? <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{String(listing.condition).replace(/_/g, " ")}</span> : null}
          {listing.buyNowPrice ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">Buy Now available</span> : null}
          {listing.type === "OFFERABLE" ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">{offerCount} offers</span> : null}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--bd-muted)]">
          <span className="truncate">{place}</span>
          <span>{formatAge(listing.createdAt)}</span>
        </div>

        <div className="mt-3 border-t border-[#F0EAFE] pt-3 text-xs font-bold leading-5 text-[var(--bd-muted)]">
          <div className="truncate text-[#3B254F]">{sellerName}</div>
          <div className="mt-1 inline-flex max-w-full items-center rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em] text-[var(--bd-purple-dark)]">
            {trustLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BrowseListingMobileCard({ listing }: { listing: BrowseListing }) {
  const image = getListingImage(listing);
  const price = listing.buyNowPrice ?? listing.price;
  const typeLabel = saleTypeLabel(listing);
  const handover = handoverLabel(listing.fulfillmentType);
  const offerCount = listing._count?.offers ?? 0;
  const highestOffer = listing.offers?.[0]?.amount ?? null;
  const remaining = timeRemaining(listing.offers?.[0]?.expiresAt ?? null);
  const sellerName = listing.seller?.name || listing.seller?.username || "Bidra seller";
  const trustLabel = sellerTrustLabel(listing.seller);
  const place = suburbLabel(listing.location);

  return (
    <Link href={"/listings/" + listing.id} className="block overflow-hidden rounded-[30px] border border-[var(--bd-border)] bg-white shadow-[0_18px_50px_rgba(43,16,85,0.10)] active:scale-[0.995]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F8FAFC]">
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="100vw" className="object-cover" unoptimized />
        ) : (
          <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone={typeLabel.includes("Buy") ? "buy" : "offer"}>{typeLabel}</Badge>
          {listing.buyNowPrice && listing.type === "OFFERABLE" ? <Badge tone="neutral">Flexible deal</Badge> : null}
        </div>

        {remaining ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#120724]/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.10em] text-white shadow-sm">
            {remaining}
          </span>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.02em] text-[var(--bd-ink)]">{listing.title}</h3>
            <p className="mt-2 text-2xl font-black tracking-[-0.045em] text-[var(--bd-ink)]">{formatPrice(price)}</p>
            {listing.type === "OFFERABLE" && highestOffer ? (
              <p className="mt-1 text-xs font-black uppercase tracking-[0.10em] text-[var(--bd-purple-dark)]">Highest offer {formatPrice(highestOffer)}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">{formatAge(listing.createdAt)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[#3730A3]">
          <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{handover}</span>
          {listing.condition ? <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1">{String(listing.condition).replace(/_/g, " ")}</span> : null}
          {listing.buyNowPrice ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">Buy Now available</span> : null}
          {listing.type === "OFFERABLE" ? <span className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1">{offerCount} offers</span> : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-[var(--bd-muted)]">
          <span className="min-w-0 truncate">{place}</span>
          <span className="shrink-0 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--bd-purple-dark)]">{trustLabel}</span>
        </div>
        <p className="mt-1 truncate text-xs font-bold text-[#8B7A98]">{sellerName}</p>
      </div>
    </Link>
  );
}