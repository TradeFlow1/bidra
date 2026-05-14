import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("bd-shell py-5 sm:py-7 lg:py-8", className)}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, description, actionHref, actionLabel }: { eyebrow?: string; title: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#607089]">{eyebrow}</div> : null}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#07152E] sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#526173]">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? <Link href={actionHref} className="bd-btn bd-btn-secondary rounded-full">{actionLabel}</Link> : null}
    </div>
  );
}

export function TrustBadge({ title, description, icon = "✓" }: { title: string; description?: string; icon?: string }) {
  return (
    <div className="flex gap-3 rounded-[18px] border border-[#D7E2F1] bg-white/85 p-4 shadow-sm">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-sm font-black text-[#0B4DFF]">{icon}</div>
      <div>
        <div className="text-sm font-extrabold text-[#0F172A]">{title}</div>
        {description ? <p className="mt-1 text-xs leading-5 text-[#607089]">{description}</p> : null}
      </div>
    </div>
  );
}

export function CategoryTile({ href, label, count, icon = "▣" }: { href: string; label: string; count?: number; icon?: string }) {
  return (
    <Link href={href} className="rounded-[20px] border border-[#D7E2F1] bg-[#F8FAFF] p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl shadow-sm" aria-hidden="true">{icon}</div>
      <div className="mt-3 truncate text-sm font-extrabold text-[#0F172A]">{label}</div>
      <div className="mt-1 text-xs font-semibold text-[#607089]">{count ? count.toLocaleString() + " items" : "Explore"}</div>
    </Link>
  );
}

export function HelpArticleCard({ href, title, description, icon = "?" }: { href: string; title: string; description: string; icon?: string }) {
  return (
    <Link href={href} className="flex items-start gap-3 rounded-[20px] border border-[#D7E2F1] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9CAE2]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0B4DFF]">{icon}</span>
      <span><span className="block text-sm font-extrabold text-[#0F172A]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#607089]">{description}</span></span>
    </Link>
  );
}
