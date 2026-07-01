import Image from "next/image";
import Link from "next/link";
import { anchorButtonClassName } from "@/components/ui";

export type MarketplaceHeroListing = {
  id: string;
  title: string;
  price?: number | null;
  buyNowPrice?: number | null;
  currentOffer?: number | null;
  type?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  offerCount?: number | null;
  endsAt?: Date | string | null;
};

function formatMoney(cents: number | null | undefined) {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeLeft(value: Date | string | null | undefined) {
  if (!value) return "2d 14h 32m";
  const end = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(end.getTime())) return "2d 14h 32m";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Closing soon";
  const totalMinutes = Math.max(1, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function HeroIcon({ label }: { label: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E8E2EF] bg-[#F7F5FA] text-[13px] font-black text-[#4F2DC9]">
      {label}
    </span>
  );
}

function FeaturedAuctionCard({ listing }: { listing?: MarketplaceHeroListing | null }) {
  const title = listing?.title || "1970 Ford Mustang Mach 1";
  const price = listing?.currentOffer || listing?.buyNowPrice || listing?.price || 5625000;
  const location = listing?.location || "Australia";
  const offerCount = listing?.offerCount ?? 4490;
  const href = listing?.id ? `/listings/${listing.id}` : "/listings";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[24px] border border-white/16 bg-white/8 shadow-[0_28px_90px_rgba(0,0,0,0.30)] ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-white/24"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#F4EFFF,#FFFFFF)]">
        {listing?.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 520px, 92vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_44%,rgba(124,58,237,0.55),transparent_28%),linear-gradient(135deg,#251044,#10061F)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-[#E8E2EF] bg-white/90 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#4F2DC9] backdrop-blur">
          Featured today
        </div>
        <div className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-black text-[#17131F] backdrop-blur">
          {timeLeft(listing?.endsAt)}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-black tracking-[-0.04em] text-[#17131F]">{title}</h2>
          <p className="mt-2 text-xs font-semibold text-[#6C6778]">
            {offerCount.toLocaleString("en-AU")} offers • ready to review
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4F2DC9]">From</p>
          <p className="text-3xl font-black tracking-[-0.05em] text-[#17131F]">{formatMoney(price)}</p>
          <p className="mt-1 max-w-[150px] truncate text-[11px] font-semibold text-[#6C6778]">{location}</p>
        </div>
      </div>
    </Link>
  );
}

export function MarketplaceHero({ listing }: { listing?: MarketplaceHeroListing | null }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#E8E2EF] bg-[linear-gradient(135deg,#FCFBFE_0%,#F6F1FF_100%)] px-4 py-5 text-[#17131F] shadow-[0_16px_40px_rgba(15,12,22,0.06)] sm:px-6 sm:py-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 lg:px-8 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,63,245,0.12),transparent_42%)]" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center rounded-full border border-[#E8E2EF] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#4F2DC9]">
          Premium marketplace • Trusted by locals
        </div>
        <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-[52px]">
          Discover better buys
          <span className="mt-2 block text-[#4F2DC9]">with more clarity.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-[#4F475D] sm:text-base">
          Browse clear listings, secure handover options, and trustworthy seller details in a calmer marketplace experience.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/listings" className={anchorButtonClassName("primary", "md")}>Browse listings</Link>
          <Link href="/sell/new" className={anchorButtonClassName("secondary", "md")}>Sell your item</Link>
        </div>

        <div className="mt-6 grid gap-3 border-t border-[#E8E2EF] pt-4 text-xs font-semibold text-[#4F475D] sm:grid-cols-2 lg:grid-cols-4">
          <span className="inline-flex items-center gap-2"><HeroIcon label="S" /> Secure and trusted</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="AU" /> Australia wide</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="$" /> Free to list</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="24" /> Live support</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 lg:mt-0">
        <FeaturedAuctionCard listing={listing} />
      </div>
    </section>
  );
}
