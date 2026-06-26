import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { MarketplaceIcon } from "@/components/marketplace-ui";
import { cn } from "@/lib/utils";

type MarketplaceIconName = React.ComponentProps<typeof MarketplaceIcon>["name"];

type FeaturedHeroListing = {
  id: string;
  title: string;
  category: string;
  price: number;
  location?: string | null;
  type?: string | null;
  offerCount?: number | null;
  endsAt?: string | Date | null;
  sellerName?: string | null;
  imageUrl?: string | null;
};

type SurfaceTone = "default" | "soft" | "dark";

const iconAliases: Record<string, MarketplaceIconName> = {
  account: "account",
  appliances: "listing",
  ball: "browse",
  browse: "browse",
  camera: "listing",
  car: "browse",
  electronics: "listing",
  filter: "filter",
  grid: "listing",
  handover: "handover",
  heart: "heart",
  help: "help",
  home: "home",
  legal: "legal",
  listing: "listing",
  location: "handover",
  messages: "messages",
  offer: "offer",
  orders: "orders",
  phone: "listing",
  profile: "account",
  safe: "safe",
  search: "search",
  sell: "sell",
  shirt: "listing",
  sports: "browse",
  vehicles: "browse",
};

export const appShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10";
export const appNarrowShell = "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;

  return (value / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}

function compactLocation(value?: string | null) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Australia";
  const first = raw.split(",")[0]?.trim() || raw;
  return first.replace(/^\d{4}\s+/, "").trim() || raw;
}

function compactTimeRemaining(value?: string | Date | null) {
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

function heroSaleType(item: FeaturedHeroListing) {
  if (item.type === "OFFERABLE") return typeof item.offerCount === "number" && item.offerCount > 0 ? `${item.offerCount} offers` : "Make an offer";
  return "Buy now";
}

export function normaliseMarketplaceIcon(icon?: string | null): MarketplaceIconName {
  return iconAliases[String(icon || "listing").trim().toLowerCase()] || "listing";
}

export function ReferencePage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("bg-[#FBF9FF] pb-10 text-[#120724]", className)}>
      {children}
    </main>
  );
}

export function AppButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "bd-btn min-h-12 rounded-2xl px-6 text-center",
        variant === "primary" && "bd-btn-primary",
        variant === "secondary" && "bd-btn-secondary",
        variant === "ghost" && "bd-btn-ghost",
        variant === "destructive" && "bd-btn-destructive",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AppPanel({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: SurfaceTone;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(43,16,85,0.07)] sm:p-7",
        tone === "default" && "border-[#EDE9FE] bg-white",
        tone === "soft" && "border-[#DDD6FE] bg-[#FBF9FF]",
        tone === "dark" && "border-white/10 bg-[#120724] text-white shadow-[0_22px_70px_rgba(18,7,36,0.24)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AppCard({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn(
    "rounded-[24px] border border-[#EDE9FE] bg-white p-4 shadow-[0_14px_40px_rgba(43,16,85,0.06)] transition",
    href && "hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_24px_70px_rgba(43,16,85,0.12)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

export function TrustItem({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <AppCard className="bg-white/86">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F5F3FF] text-[#6D28D9]">
        <MarketplaceIcon name={normaliseMarketplaceIcon(icon)} className="h-5 w-5" />
      </span>
      <div className="mt-3 text-sm font-black text-[#120724]">{title}</div>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#62516F]">{body}</p>
    </AppCard>
  );
}

export function HomeHero({
  sellHref,
  featuredListings = [],
}: {
  sellHref: string;
  featuredListings?: FeaturedHeroListing[];
}) {
  const hasListings = featuredListings.length > 0;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#120724] text-white shadow-[0_28px_90px_rgba(18,7,36,0.26)]">
      <div className="absolute inset-0 bg-[radial-gradient(780px_360px_at_76%_8%,rgba(124,58,237,0.30),transparent_68%),linear-gradient(135deg,#10061F_0%,#150A28_56%,#21103C_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(196,181,253,0.55),transparent)]" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_520px] lg:p-10 xl:p-12">
        <div className="flex min-h-[480px] flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD] shadow-sm">
            Australian peer-to-peer marketplace
          </div>

          <h1 className="mt-6 max-w-3xl text-[44px] font-black leading-[0.92] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
            Find the right item. Deal with confidence.
          </h1>

          <div className="mt-7 rounded-[24px] border border-white/15 bg-white/10 p-3 shadow-[0_18px_50px_rgba(18,7,36,0.22)] backdrop-blur">
            <form action="/listings" className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                name="q"
                placeholder="Search cars, tools, furniture, electronics"
                className="h-14 rounded-2xl border border-white/10 bg-white px-5 text-base font-bold text-[#120724] outline-none placeholder:text-[#8B7A98] focus:border-[#C4B5FD] focus:ring-4 focus:ring-white/15"
              />
              <button className="bd-btn bd-btn-primary h-14 rounded-2xl px-7" type="submit">
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2 px-1 text-xs font-black text-white/78">
              {["Vehicles", "Tools", "Home & Living", "Electronics"].map((item) => (
                <Link key={item} href={`/listings?category=${encodeURIComponent(item)}`} className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 transition hover:bg-white/14">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <AppButtonLink href="/listings">Browse listings</AppButtonLink>
            <AppButtonLink href={sellHref} variant="secondary">
              Sell your item
            </AppButtonLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-bold text-white/82">Real listings only</div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-bold text-white/82">Messages on record</div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-bold text-white/82">Australia wide</div>
          </div>
        </div>

        <ProductCollage listings={featuredListings} sellHref={sellHref} />
      </div>

      <div className="relative border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-7 lg:px-10 xl:px-12">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-white/58">
          <span>{hasListings ? `${featuredListings.length} live ${featuredListings.length === 1 ? "listing" : "listings"} in focus` : "Ready for seller inventory"}</span>
          <span>Seller profiles</span>
          <span>Saved messages</span>
          <span>Order records</span>
        </div>
      </div>
    </section>
  );
}

export function ProductCollage({
  listings = [],
  sellHref = "/sell/new",
  className,
}: {
  listings?: FeaturedHeroListing[];
  sellHref?: string;
  className?: string;
}) {
  const items = listings.slice(0, 4);

  return (
    <div className={cn("hidden min-h-[480px] lg:block", className)}>
      <div className="grid h-full min-h-[480px] gap-4">
        {items.length ? (
          <div className="grid min-h-[320px] gap-4">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className={cn(
                  "group relative grid overflow-hidden rounded-[30px] border border-white/12 bg-white text-[#120724] shadow-[0_22px_65px_rgba(18,7,36,0.22)] transition hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(18,7,36,0.28)]",
                  index === 0 ? "min-h-[260px]" : "min-h-[132px] grid-cols-[150px_minmax(0,1fr)]",
                  index > 2 && "hidden",
                )}
              >
                <div className={cn("relative overflow-hidden bg-[#1B102C]", index === 0 ? "min-h-[260px]" : "min-h-[132px]")}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes={index === 0 ? "520px" : "180px"}
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[132px] items-center justify-center bg-[linear-gradient(135deg,#24143A,#120724)] px-5 text-center text-xs font-black uppercase tracking-[0.16em] text-white/48">
                      Image pending
                    </div>
                  )}
                  {index === 0 ? <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(18,7,36,0.72)_100%)]" /> : null}
                </div>

                <div className={cn(index === 0 ? "absolute inset-x-4 bottom-4 rounded-3xl border border-white/60 bg-white/94 p-4 shadow-lg backdrop-blur" : "p-4")}>
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#6D28D9]">
                    <span className="truncate">{heroSaleType(item)}</span>
                    <span className="shrink-0">{compactTimeRemaining(item.endsAt) || compactLocation(item.location)}</span>
                  </div>
                  <div className={cn("mt-1 truncate font-black text-[#120724]", index === 0 ? "text-lg" : "text-sm")}>{item.title}</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-base font-black text-[#120724]">{formatMoney(item.price)}</span>
                    <span className="truncate text-[11px] font-bold text-[#62516F]">{item.sellerName || compactLocation(item.location)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/listings" className="rounded-[28px] border border-white/12 bg-white/10 p-5 shadow-[0_18px_54px_rgba(18,7,36,0.18)] backdrop-blur transition hover:bg-white/14">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">Browse</div>
            <div className="mt-2 text-xl font-black tracking-[-0.04em] text-white">Explore active listings</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/62">Search by item, suburb or category.</p>
          </Link>
          <Link href={sellHref} className="rounded-[28px] border border-white/12 bg-white text-[#120724] p-5 shadow-[0_18px_54px_rgba(18,7,36,0.18)] transition hover:-translate-y-0.5">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6D28D9]">Sell</div>
            <div className="mt-2 text-xl font-black tracking-[-0.04em]">List a quality item</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#62516F]">Photos, price and handover details in one flow.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HomeTrustStrip() {
  const items = [
    ["safe", "Safety signals", "Reports, moderation and message records"],
    ["offer", "Flexible deals", "Buy now or make an offer"],
    ["location", "Handover ready", "Pickup, postage and local arrangements"],
    ["profile", "Seller context", "Profile and listing signals up front"],
  ] as const;

  return (
    <section className="my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([icon, title, body]) => (
        <TrustItem key={title} icon={icon} title={title} body={body} />
      ))}
    </section>
  );
}

export function TrustStrip() {
  return <HomeTrustStrip />;
}

export function MarketplaceSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-5 sm:py-8", className)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.20em] text-[#7C3AED]">{eyebrow}</div> : null}
          <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#120724] sm:text-3xl">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#62516F]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </section>
  );
}

export function CategoryPillGrid({
  categories,
}: {
  categories: Array<{ label: string; href: string; icon?: string; meta?: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <AppCard key={category.href + category.label} href={category.href} className="group">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F5F3FF] text-[#6D28D9]">
            <MarketplaceIcon name={normaliseMarketplaceIcon(category.icon)} className="h-5 w-5" />
          </span>
          <div className="mt-4 text-sm font-black text-[#120724]">{category.label}</div>
          <div className="mt-1 text-xs font-bold text-[#62516F]">{category.meta || "Explore"}</div>
        </AppCard>
      ))}
    </div>
  );
}

export function EmptyMarketplaceState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="col-span-full rounded-[28px] border border-dashed border-[#C4B5FD] bg-white p-8 text-center shadow-[0_18px_50px_rgba(43,16,85,0.07)]">
      <h3 className="text-xl font-black text-[#120724]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[#62516F]">{body}</p>
      {href && cta ? (
        <AppButtonLink href={href} className="mt-5 inline-flex">
          {cta}
        </AppButtonLink>
      ) : null}
    </div>
  );
}
