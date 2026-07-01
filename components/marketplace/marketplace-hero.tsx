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
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-[13px] font-black text-white/90">
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
      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#201038,#0B0417)]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/10 to-black/20" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          Featured today
        </div>
        <div className="absolute right-4 top-4 rounded-lg bg-black/48 px-3 py-2 text-xs font-black text-white backdrop-blur">
          {timeLeft(listing?.endsAt)}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-black tracking-[-0.04em]">{title}</h2>
          <p className="mt-2 text-xs font-bold text-white/70">
            {offerCount.toLocaleString("en-AU")} bids <span className="px-2">-</span> Reserve met
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold text-white/68">Current bid</p>
          <p className="text-3xl font-black tracking-[-0.05em]">{formatMoney(price)}</p>
          <p className="mt-1 max-w-[150px] truncate text-[11px] font-bold text-white/60">{location}</p>
        </div>
      </div>
    </Link>
  );
}

export function MarketplaceHero({ listing }: { listing?: MarketplaceHeroListing | null }) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(760px_360px_at_82%_18%,rgba(124,58,237,0.40),transparent_70%),linear-gradient(135deg,#120724_0%,#180A2C_54%,#221041_100%)] px-5 py-8 text-white shadow-[0_32px_110px_rgba(18,7,36,0.30)] sm:px-8 sm:py-10 lg:grid lg:grid-cols-[1fr_560px] lg:items-center lg:gap-10 lg:px-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,transparent_0%,transparent_56%,rgba(167,139,250,0.18)_56%,transparent_72%)]" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
          Premium marketplace • Trusted by locals
        </div>
        <h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.065em] sm:text-6xl lg:text-[64px]">
          Discover better buys<br />
          <span className="bg-gradient-to-r from-[#D8CCFF] via-[#A78BFA] to-[#F5EFFF] bg-clip-text text-transparent">done with confidence.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/76 sm:text-lg">
          Browse verified listings, secure handover options, and clear seller signals from one polished marketplace experience.
        </p>

        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Link href="/listings" className={anchorButtonClassName("primary", "lg", "!bg-[#7C3AED] !text-white hover:!bg-[#6D28D9]")}>Browse all listings</Link>
          <Link href="/sell/new" className={anchorButtonClassName("secondary", "lg", "border-white/18 bg-white/95 !text-[#5B21B6] hover:bg-[#F5F3FF] hover:!text-[#5B21B6]")}>Sell your item</Link>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs font-bold text-white/76 sm:flex sm:flex-wrap sm:gap-6">
          <span className="inline-flex items-center gap-2"><HeroIcon label="S" /> Secure and trusted</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="AU" /> Australia wide</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="$" /> Free to list</span>
          <span className="inline-flex items-center gap-2"><HeroIcon label="24" /> Live support</span>
        </div>
      </div>

      <div className="relative z-10 mt-9 lg:mt-0">
        <FeaturedAuctionCard listing={listing} />
        <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/70" />
          <span className="h-2 w-2 rounded-full bg-white/32" />
          <span className="h-2 w-2 rounded-full bg-white/32" />
          <span className="h-2 w-2 rounded-full bg-white/32" />
          <span className="h-2 w-2 rounded-full bg-white/32" />
        </div>
      </div>
    </section>
  );
}
