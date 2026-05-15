import Link from "next/link";
import type React from "react";
import { ProductPlaceholder, MarketplaceIcon } from "@/components/marketplace-ui";
import { cn } from "@/lib/utils";

export const appShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
export const appNarrowShell = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";

export function ReferencePage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("bg-white pb-8 text-[#07152E]", className)}>{children}</main>;
}

export function ReferenceHero({ eyebrow, title, description, children, actions }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8 lg:rounded-[36px] lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center">
        <div>
          {eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0B4DFF]">{eyebrow}</div> : null}
          <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.055em] text-[#07152E] sm:text-5xl lg:text-7xl">{title}</h1>
          {description ? <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#36506F] sm:text-lg">{description}</p> : null}
          {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function ProductCollage() {
  const products = [
    { kind: "sofa", className: "col-span-7 row-span-2", price: "$240" },
    { kind: "bicycle", className: "col-span-5 row-span-1", price: "$180" },
    { kind: "headphones", className: "col-span-5 row-span-1", price: "$75" },
    { kind: "camera", className: "col-span-4 row-span-1", price: "$320" },
    { kind: "phone", className: "col-span-4 row-span-1", price: "$410" },
    { kind: "coffee-machine", className: "col-span-4 row-span-1", price: "$95" },
  ];
  return (
    <div className="relative min-h-[340px] rounded-[30px] bg-white/70 p-3 shadow-inner ring-1 ring-white/80 sm:min-h-[430px]">
      <div className="grid h-full min-h-[318px] grid-cols-12 grid-rows-3 gap-3 sm:min-h-[408px]">
        {products.map((item) => (
          <div key={item.kind} className={cn("relative overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_16px_45px_rgba(32,75,140,0.12)]", item.className)}>
            <ProductPlaceholder kind={item.kind} className="min-h-full" />
            <span className="absolute left-3 top-3 rounded-full bg-[#0B4DFF] px-3 py-1 text-xs font-black text-white shadow-lg">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="absolute -bottom-3 right-5 rounded-full border border-[#CFE0F4] bg-white px-4 py-2 text-sm font-black text-[#07152E] shadow-xl">Local deals near you</div>
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
        <div key={label} className="flex min-h-16 items-center gap-3 rounded-[22px] border border-[#D8E6F8] bg-white px-4 py-3 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF6FF] text-[#0B4DFF]"><MarketplaceIcon name={icon} /></span>
          <span className="text-sm font-black text-[#07152E]">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function MarketplaceSection({ eyebrow, title, action, children, className }: { eyebrow?: string; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("py-5 sm:py-7", className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">{eyebrow}</div> : null}
          <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#07152E] sm:text-3xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CategoryPillGrid({ categories }: { categories: Array<{ label: string; href: string; icon?: string; meta?: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {categories.map((category) => (
        <Link key={category.href + category.label} href={category.href} className="group flex min-h-[118px] flex-col justify-between rounded-[24px] border border-[#D8E6F8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#AFC8F8] hover:shadow-[0_16px_45px_rgba(32,75,140,0.12)]">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF6FF] text-xl">{category.icon || "•"}</span>
          <span>
            <span className="block text-base font-black text-[#07152E]">{category.label}</span>
            <span className="mt-1 block text-xs font-bold text-[#607089]">{category.meta || "Explore"}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AppPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-[28px] border border-[#D8E6F8] bg-white p-4 shadow-sm sm:p-6", className)}>{children}</div>;
}

export function EmptyMarketplaceState({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="col-span-full rounded-[28px] border border-[#D8E6F8] bg-[#F7FAFF] p-8 text-center shadow-sm">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-[28px] border border-[#D8E6F8] bg-white"><ProductPlaceholder kind="empty" /></div>
      <h3 className="mt-5 text-2xl font-black tracking-tight text-[#07152E]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#526173]">{body}</p>
      <Link href={href} className="bd-btn bd-btn-primary mt-5 rounded-2xl">{cta}</Link>
    </div>
  );
}
