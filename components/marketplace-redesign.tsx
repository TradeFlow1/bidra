import Link from "next/link";
import type React from "react";
import { ProductPlaceholder, MarketplaceIcon } from "@/components/marketplace-ui";
import { cn } from "@/lib/utils";

export const appShell = "mx-auto w-full max-w-[1520px] px-4 sm:px-6 lg:px-10 xl:px-12";
export const appNarrowShell = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";

export function ReferencePage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("bidra-homepage bg-white pb-8 text-[#0F172A]", className)}>{children}</main>;
}

function BlueIcon(props: { name: string }) {
  return <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EAF6F8] text-[#0E7490]"><MarketplaceIcon name={props.name as any} className="h-5 w-5" /></span>;
}

type FeaturedHeroListing = {
  id: string;
  title: string;
  category: string;
  price: number;
};

export function HomeHero({ sellHref, featuredListings = [] }: { sellHref: string; featuredListings?: FeaturedHeroListing[] }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#D8E1EA] bg-[linear-gradient(135deg,#F8FBFC_0%,#EAF6F8_100%)] p-5 shadow-[0_22px_70px_rgba(32,75,140,0.10)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -bottom-24 hidden h-80 w-80 rounded-full bg-[#CFEFF3]/70 blur-2xl lg:block" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] lg:items-center">
        <div className="min-w-0">
          <div className="inline-flex max-w-full rounded-full border border-[#C8DAE3] bg-white px-3 py-2 text-[11px] font-black leading-none text-[#0E7490] shadow-sm">
            Local marketplace
          </div>

          <h1 className="mt-5 max-w-[680px] text-[34px] font-black leading-[0.95] tracking-[-0.055em] text-[#0F172A] sm:text-5xl lg:text-7xl">
            Buy, sell and discover local deals.
          </h1>

          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-[#334155] sm:text-base">
            Buy now. Make offers. Arrange handover.
          </p>

          <div className="mt-5 grid gap-3 sm:flex">
            <Link href="/listings" className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#0E7490] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(14,116,144,0.22)] sm:w-auto">
              Browse listings
            </Link>
            <Link href={sellHref} className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#D8E1EA] bg-white px-6 text-sm font-black text-[#0F172A] shadow-sm sm:w-auto">
              Sell an item
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
            <div className="rounded-2xl bg-white/80 px-2 py-3 text-center shadow-sm ring-1 ring-[#D8E5EA] sm:flex sm:items-center sm:gap-3 sm:bg-transparent sm:p-0 sm:text-left sm:shadow-none sm:ring-0">
              <div className="flex justify-center sm:block"><BlueIcon name="safe" /></div>
              <div className="mt-1 text-[11px] font-black leading-none text-[#0F172A] sm:mt-0 sm:text-sm sm:leading-normal">Safe</div>
            </div>
            <div className="rounded-2xl bg-white/80 px-2 py-3 text-center shadow-sm ring-1 ring-[#D8E5EA] sm:flex sm:items-center sm:gap-3 sm:bg-transparent sm:p-0 sm:text-left sm:shadow-none sm:ring-0">
              <div className="flex justify-center sm:block"><BlueIcon name="location" /></div>
              <div className="mt-1 text-[11px] font-black leading-none text-[#0F172A] sm:mt-0 sm:text-sm sm:leading-normal">Local</div>
            </div>
            <div className="rounded-2xl bg-white/80 px-2 py-3 text-center shadow-sm ring-1 ring-[#D8E5EA] sm:flex sm:items-center sm:gap-3 sm:bg-transparent sm:p-0 sm:text-left sm:shadow-none sm:ring-0">
              <div className="flex justify-center sm:block"><BlueIcon name="offer" /></div>
              <div className="mt-1 text-[11px] font-black leading-none text-[#0F172A] sm:mt-0 sm:text-sm sm:leading-normal">Deals</div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <ProductCollage listings={featuredListings} />
        </div>
      </div>
    </section>
  );
}

export function ProductCollage({ listings = [] }: { listings?: FeaturedHeroListing[] }) {
  const fallbackProducts: FeaturedHeroListing[] = [
    { id: "fallback-sofa", title: "Fresh local sofa", category: "Home", price: 250 },
    { id: "fallback-bike", title: "Popular road bike", category: "Sports", price: 120 },
    { id: "fallback-headphones", title: "Wireless headphones", category: "Electronics", price: 60 },
    { id: "fallback-camera", title: "Camera gear", category: "Electronics", price: 450 },
  ];

  const heroListings = [...listings, ...fallbackProducts].slice(0, 4);
  const productKinds = ["sofa", "bicycle", "headphones", "camera"];
  const positions = [
    "lg:col-start-1 lg:row-start-1",
    "lg:col-start-2 lg:row-start-1",
    "lg:col-start-1 lg:row-start-2 lg:ml-12",
    "lg:col-start-2 lg:row-start-2",
  ];

  return (
    <div className="relative hidden grid-cols-2 gap-4 sm:grid lg:grid lg:min-h-[430px]">
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#D7EEF2] opacity-70" />
      {heroListings.map((item, index) => (
        <Link
          key={item.id}
          href={item.id.startsWith("fallback-") ? "/listings" : `/listings/${item.id}`}
          className={cn(
            "group relative min-h-[170px] overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_18px_50px_rgba(32,75,140,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(32,75,140,0.18)] sm:min-h-[190px] lg:min-h-[195px]",
            positions[index] || "",
          )}
        >
          <ProductPlaceholder kind={productKinds[index] || "empty"} className="h-full min-h-[150px]" />
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0E7490] shadow-lg ring-1 ring-[#D8E1EA]">
            {item.category || "Listing"}
          </span>
          <span className="absolute bottom-12 left-3 max-w-[calc(100%-24px)] truncate rounded-full bg-white px-3 py-1 text-xs font-black text-[#0F172A] shadow-lg ring-1 ring-[#D8E1EA]">
            {item.title}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[#0F172A] shadow-lg ring-1 ring-[#D8E1EA]">
            ${item.price.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function TrustStrip() {
  const items = [
    ["safe", "Verified accounts"],
    ["offer", "Buy now or offer"],
    ["handover", "Arrange handover directly"],
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(([icon, label]) => (
        <div key={label} className="flex min-h-16 items-center gap-3 rounded-[22px] border border-[#D8E1EA] bg-white px-4 py-3 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F1F8FA] text-[#0E7490]"><MarketplaceIcon name={icon} /></span>
          <span className="text-sm font-black text-[#0F172A]">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function HomeTrustStrip() {
  const items = [
    ["safe", "100% Free", "No listing fees"],
    ["location", "Local", "Connect in your area"],
    ["safe", "Secure", "Safety comes first"],
    ["profile", "Trusted", "Community driven"],
  ] as const;
  return (
    <section className="my-8 hidden gap-4 rounded-[28px] border border-[#D8E1EA] bg-[#F6F8FB] p-5 shadow-sm md:grid md:grid-cols-2 lg:grid-cols-4 lg:p-7">
      {items.map(([icon, title, body]) => (
        <div key={title} className="flex items-center gap-3">
          <BlueIcon name={icon} />
          <div><div className="text-sm font-black text-[#0F172A]">{title}</div><div className="mt-1 text-xs font-semibold text-[#64748B]">{body}</div></div>
        </div>
      ))}
    </section>
  );
}

export function MarketplaceSection({ eyebrow, title, action, children, className }: { eyebrow?: string; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("py-4 sm:py-8", className)}>
      <div className="mb-4 flex flex-row items-end justify-between gap-3">
        <div>
          {eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">{eyebrow}</div> : null}
          <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#0F172A] sm:text-3xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CategoryPillGrid({ categories }: { categories: Array<{ label: string; href: string; icon?: string; meta?: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <Link key={category.href + "-" + category.label} href={category.href} className="group flex min-h-[104px] flex-col items-center justify-center rounded-[20px] border border-[#D8E1EA] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#9CCDD6] hover:shadow-[0_16px_45px_rgba(32,75,140,0.12)] sm:min-h-[132px] sm:p-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F6F8FB] text-[#0F172A] sm:h-12 sm:w-12"><MarketplaceIcon name={category.icon as any} className="h-5 w-5 sm:h-6 sm:w-6" /></span>
          <span className="mt-2 block text-xs font-black text-[#0F172A] sm:mt-3 sm:text-sm">{category.label}</span>
          <span className="mt-1 block text-xs font-bold text-[#64748B]">{category.meta || "Explore"}</span>
        </Link>
      ))}
    </div>
  );
}

export function NavyMarketplaceCta() {
  return (
    <section className="my-8 hidden overflow-hidden rounded-[30px] bg-[#0F172A] text-white shadow-[0_24px_80px_rgba(7,21,46,0.22)] md:block">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.65fr_1fr_0.65fr] lg:items-center">
        <div className="hidden h-36 overflow-hidden rounded-[26px] border border-white/10 bg-white/10 p-4 lg:block">
          <div className="h-full rounded-[22px] bg-white p-4 text-[#0F172A] shadow-2xl">
            <div className="text-lg font-black">bidra</div>
            <div className="mt-8 h-2 rounded-full bg-[#EAF6F8]" />
            <div className="mt-3 h-2 w-3/4 rounded-full bg-[#EAF6F8]" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">The smarter way to buy and sell locally.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C9D8EF]">Join Australians using Bidra to buy now, make offers and arrange handover.</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/listings" className="rounded-xl border border-white/20 bg-white px-4 py-2 text-xs font-black text-[#0F172A]">Browse listings</Link>
          <Link href="/sell/new" className="rounded-xl border border-white/20 bg-[#0E7490] px-4 py-2 text-xs font-black text-white">Sell an item</Link>
        </div>
      </div>
    </section>
  );
}

export function AppPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-[28px] border border-[#D8E1EA] bg-white p-4 shadow-sm sm:p-6", className)}>{children}</div>;
}

export function EmptyMarketplaceState({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="col-span-full rounded-[28px] border border-[#D8E1EA] bg-[#F6F8FB] p-8 text-center shadow-sm">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-[28px] border border-[#D8E1EA] bg-white"><ProductPlaceholder kind="empty" /></div>
      <h3 className="mt-5 text-2xl font-black tracking-tight text-[#0F172A]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#526173]">{body}</p>
      <Link href={href} className="bd-btn bd-btn-primary mt-5 rounded-2xl">{cta}</Link>
    </div>
  );
}

