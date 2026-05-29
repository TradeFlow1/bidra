import type React from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export function PageShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8", className)}>{children}</div>;
}

export function BrandSymbol({ className }: { className?: string }) {
  return <BrandLogo variant="symbol" className={cn("h-10 w-10", className)} />;
}

type MarketplaceIconName = "home" | "browse" | "sell" | "messages" | "account" | "search" | "heart" | "safe" | "handover" | "offer" | "listing" | "filter" | "help" | "legal" | "orders";
export function MarketplaceIcon({ name, className = "h-5 w-5" }: { name: MarketplaceIconName; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" /></svg>;
  if (name === "browse") return <svg {...common}><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>;
  if (name === "sell") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "messages") return <svg {...common}><path d="M5 6.5h14v9H8l-3 3v-12Z" /></svg>;
  if (name === "account") return <svg {...common}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (name === "search") return <svg {...common}><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="7" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.7 4.7 0 0 1 12 5.6a4.7 4.7 0 0 1 8.8 3.1Z" /></svg>;
  if (name === "safe") return <svg {...common}><path d="M12 3 5 6v5c0 4.7 3 8.4 7 10 4-1.6 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></svg>;
  if (name === "handover") return <svg {...common}><path d="M8 12h8" /><path d="m13 9 3 3-3 3" /><path d="M5 7h14v10H5z" /></svg>;
  if (name === "offer") return <svg {...common}><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" /><path d="M4 12 12 4l8 8" /><path d="M9 15h6" /></svg>;
  if (name === "filter") return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
  if (name === "help") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 0 1 5 1.4c0 1.8-2.5 2.1-2.5 3.8" /><path d="M12 17h.01" /></svg>;
  if (name === "legal") return <svg {...common}><path d="M7 4h10v16H7z" /><path d="M9.5 8h5M9.5 12h5M9.5 16h3" /></svg>;
  if (name === "orders") return <svg {...common}><path d="M7 7h10v14H7z" /><path d="M9 4h6v3H9z" /><path d="M9.5 12h5M9.5 16h5" /></svg>;
  return <svg {...common}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
}

const placeholderCopy: Record<string, { title: string; path: React.ReactNode }> = {
  sofa: { title: "Sofa", path: <><path d="M6 13h12a2 2 0 0 1 2 2v3H4v-3a2 2 0 0 1 2-2Z" /><path d="M7 13V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><path d="M6 18v2M18 18v2" /></> },
  bicycle: { title: "Bike", path: <><circle cx="7" cy="16" r="3" /><circle cx="17" cy="16" r="3" /><path d="M7 16l4-7h2l4 7M11 9l2 7M10 16h4M13 9h3" /></> },
  headphones: { title: "Headphones", path: <><path d="M5 14v-2a7 7 0 0 1 14 0v2" /><path d="M5 14h3v5H6a1 1 0 0 1-1-1v-4ZM19 14h-3v5h2a1 1 0 0 0 1-1v-4Z" /></> },
  furniture: { title: "Furniture", path: <><path d="M5 12h14v6H5z" /><path d="M7 12V8h10v4" /><path d="M7 18v2M17 18v2" /></> },
  camera: { title: "Camera", path: <><path d="M5 8h4l1.5-2h3L15 8h4v10H5z" /><circle cx="12" cy="13" r="3" /></> },
  phone: { title: "Phone", path: <><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M11 18h2" /></> },
  laptop: { title: "Laptop", path: <><path d="M6 6h12v9H6z" /><path d="M4 18h16" /></> },
  "coffee-machine": { title: "Coffee", path: <><path d="M8 6h8v12H8z" /><path d="M16 9h3a2 2 0 0 1 0 4h-3" /><path d="M10 3v3M14 3v3M9 18h6" /></> },
  messages: { title: "Messages", path: <><path d="M5 6.5h14v9H8l-3 3v-12Z" /><path d="M8 10h8M8 13h5" /></> },
  empty: { title: "Empty", path: <><path d="M6 7h12v11H6z" /><path d="M9 10h6M9 13h4" /></> },
  generic: { title: "Listing", path: <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="m8 15 2.5-3 2 2 2.5-3 2 4" /></> },
};

export function ProductPlaceholder({ kind = "generic", title, className }: { kind?: keyof typeof placeholderCopy | string; title?: string; className?: string }) {
  const item = placeholderCopy[kind] || placeholderCopy.generic;
  return (
    <div className={cn("flex h-full min-h-[9rem] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#FFFFFF_0,#FFFFFF_18%,#EAF3FF_52%,#DDEBFF_100%)]", className)}>
      <div className="flex flex-col items-center gap-2 text-[#0B4DFF]">
        <svg className="h-14 w-14 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.path}</svg>
        <span className="max-w-[11rem] truncate rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#36506F] shadow-sm">{title || item.title}</span>
      </div>
    </div>
  );
}

export function AvatarPlaceholder({ name, className }: { name?: string | null; className?: string }) {
  const initials = String(name || "Bidra user").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "B";
  return <div className={cn("grid h-12 w-12 place-items-center rounded-full border border-[#CFE0F4] bg-[#EEF4FF] text-sm font-black text-[#0B4DFF] shadow-sm", className)}>{initials}</div>;
}

export function EmptyState({ icon = "empty", title, description, actionHref, actionLabel }: { icon?: string; title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#BFD1EA] bg-[#F8FAFF] p-8 text-center shadow-sm">
      <div className="mx-auto h-28 max-w-44 overflow-hidden rounded-[24px] border border-[#D7E2F1] bg-white shadow-sm"><ProductPlaceholder kind={icon} title={title} /></div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-[#07152E]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#526173]">{description}</p>
      {actionHref && actionLabel ? <Link href={actionHref} className="bd-primary-action mt-5 inline-flex">{actionLabel}</Link> : null}
    </div>
  );
}

export function PageHero({ badge, title, description, children }: { badge?: string; title: string; description?: string; children?: React.ReactNode }) {
  return <section className="bd-page-hero p-5 sm:p-7"><div className="bd-pill w-fit border-blue-100 bg-[#EEF4FF] text-[#0B4DFF]">{badge || "Australia’s trust-first local marketplace"}</div><h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-[#07152E] sm:text-5xl">{title}</h1>{description ? <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[#526173]">{description}</p> : null}{children}</section>;
}

export function SectionHeader({ eyebrow, title, description, actionHref, actionLabel }: { eyebrow?: string; title: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div>{eyebrow ? <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#607089]">{eyebrow}</div> : null}<h2 className="mt-1 text-2xl font-black tracking-tight text-[#07152E] sm:text-3xl">{title}</h2>{description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#526173]">{description}</p> : null}</div>{actionHref && actionLabel ? <Link href={actionHref} className="bd-btn bd-btn-secondary rounded-full">{actionLabel}</Link> : null}</div>;
}

export function TrustBadge({ title, description, icon = "safe" }: { title: string; description?: string; icon?: MarketplaceIconName | string }) {
  const valid = ["home", "browse", "sell", "messages", "account", "search", "heart", "safe", "handover", "offer", "listing", "filter", "help", "legal", "orders"].includes(icon);
  return <div className="flex gap-3 rounded-[18px] border border-[#D7E2F1] bg-white/85 p-4 shadow-sm"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-sm font-black text-[#0B4DFF]">{valid ? <MarketplaceIcon name={icon as MarketplaceIconName} /> : icon}</div><div><div className="text-sm font-extrabold text-[#0F172A]">{title}</div>{description ? <p className="mt-1 text-xs leading-5 text-[#607089]">{description}</p> : null}</div></div>;
}

export function CategoryTile({ href, label, count, icon = "listing" }: { href: string; label: string; count?: number; icon?: MarketplaceIconName | string }) {
  const valid = ["home", "browse", "sell", "messages", "account", "search", "heart", "safe", "handover", "offer", "listing", "filter", "help", "legal", "orders"].includes(icon);
  return <Link href={href} className="rounded-[20px] border border-[#D7E2F1] bg-[#F8FAFF] p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0B4DFF] shadow-sm" aria-hidden="true">{valid ? <MarketplaceIcon name={icon as MarketplaceIconName} /> : icon}</div><div className="mt-3 truncate text-sm font-extrabold text-[#0F172A]">{label}</div><div className="mt-1 text-xs font-semibold text-[#607089]">{count ? count.toLocaleString() + " items" : "Explore"}</div></Link>;
}

export function SellerCard({ name, location, memberSince, activeListings, children }: { name?: string | null; location?: string | null; memberSince?: string | null; activeListings?: number | null; children?: React.ReactNode }) {
  return <aside className="rounded-[24px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><AvatarPlaceholder name={name} /><div><div className="font-black text-[#07152E]">{name || "Bidra seller"}</div><div className="text-xs font-semibold text-[#607089]">{location || "Australia"}{memberSince ? ` • Member since ${memberSince}` : ""}</div></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-[#36506F]"><span className="rounded-2xl bg-[#F8FAFF] px-3 py-2">Verified signals</span><span className="rounded-2xl bg-[#F8FAFF] px-3 py-2">{typeof activeListings === "number" ? `${activeListings} active` : "Active seller"}</span></div>{children ? <div className="mt-4">{children}</div> : null}</aside>;
}

export function SafetyPanel() {
  return <section className="rounded-[24px] border border-[#D7E2F1] bg-[#F8FAFF] p-4 shadow-sm"><h2 className="text-lg font-black text-[#07152E]">Safer handover guidance</h2><ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-[#526173]"><li>Keep messages on Bidra.</li><li>Meet in safe public places.</li><li>Check item condition before handover.</li><li>Report suspicious behaviour.</li></ul></section>;
}

export function ActionPanel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="rounded-[28px] border border-[#CFE0F4] bg-white p-4 shadow-[0_20px_50px_rgba(15,40,80,0.08)]"><h2 className="text-xl font-black tracking-tight text-[#07152E]">{title}</h2>{description ? <p className="mt-2 text-sm leading-6 text-[#526173]">{description}</p> : null}<div className="mt-4 grid gap-3">{children}</div></section>;
}

export function HelpArticleCard({ href, title, description, icon = "?" }: { href: string; title: string; description: string; icon?: string }) {
  return <Link href={href} className="flex items-start gap-3 rounded-[20px] border border-[#D7E2F1] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9CAE2]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0B4DFF]">{icon}</span><span><span className="block text-sm font-extrabold text-[#0F172A]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#607089]">{description}</span></span></Link>;
}


export function ListingGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>{children}</div>;
}

export function DashboardStatCard({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) {
  return <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm"><div className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#607089]">{label}</div><div className="mt-2 text-3xl font-black tracking-tight text-[#07152E]">{value}</div>{helper ? <div className="mt-1 text-xs font-semibold text-[#607089]">{helper}</div> : null}</div>;
}

export function LegalLayout({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const links = [
    ["/legal", "Overview"], ["/legal/terms", "Terms"], ["/legal/privacy", "Privacy"], ["/legal/fees", "Fees"], ["/legal/prohibited-items", "Prohibited items"],
  ];
  return <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="rounded-[24px] border border-[#D7E2F1] bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:self-start"><div className="px-2 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#607089]">Bidra policies</div><div className="mt-1 flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">{links.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-extrabold text-[#36506F] hover:bg-[#EEF4FF] hover:text-[#0B4DFF]">{label}</Link>)}</div></aside><article className="rounded-[28px] border border-[#D7E2F1] bg-white p-5 shadow-sm sm:p-7"><div className="bd-pill w-fit border-blue-100 bg-[#EEF4FF] text-[#0B4DFF]">Australia’s trust-first local marketplace</div><h1 className="mt-4 text-3xl font-black tracking-tight text-[#07152E] sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#526173] sm:text-base">{description}</p><div className="mt-6 bd-readable-prose">{children}</div></article></div>;
}
