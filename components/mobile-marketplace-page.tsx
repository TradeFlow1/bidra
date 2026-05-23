import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type MobileMarketplacePageProps = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  children: ReactNode;
  className?: string;
  desktopChildren?: ReactNode;
  desktopTitle?: string;
  desktopSubtitle?: string;
};

type MobileCardProps = {
  children: ReactNode;
  className?: string;
};

export function MobileMarketplacePage({
  title,
  subtitle,
  backHref,
  children,
  className,
  desktopChildren,
  desktopTitle,
  desktopSubtitle,
}: MobileMarketplacePageProps) {
  return (
    <>
      <main className="min-h-screen bg-white text-[#4F46E5] md:hidden hover:bg-[#F5F3FF]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] hover:bg-[#F5F3FF]">
          <header className="relative z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur hover:bg-[#F5F3FF]">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex min-w-0 items-center gap-3">
                {backHref ? (
                  <Link href={backHref} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] text-xl font-black text-[#0F172A]">
                    ‹
                  </Link>
                ) : (
                  <button type="button" aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] text-lg font-black text-[#4F46E5]">
                    ≡
                  </button>
                )}
                {title ? (
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-black tracking-tight text-[#0F172A]">{title}</h1>
                    {subtitle ? <p className="truncate text-xs font-semibold text-[#64748B]">{subtitle}</p> : null}
                  </div>
                ) : (
                  <BrandLogo className="relative block h-10 w-[130px] overflow-visible" priority />
                )}
              </div>
              <Link href="/notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] text-[#4F46E5]">
                ♡
              </Link>
            </div>
            {!title ? (
              <div className="px-4 pb-3">
                <Link href="/listings" className="flex h-11 items-center rounded-2xl border border-[#C7D2FE] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#64748B]">
                  Search listings
                </Link>
              </div>
            ) : null}
          </header>
          <div className={cn("px-4 pb-24 pt-4", className)}>{children}</div>
          <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto grid h-16 max-w-[430px] grid-cols-5 border-t border-[#E2E8F0] bg-white/95 px-2 text-[11px] font-bold text-[#475569] backdrop-blur hover:bg-[#F5F3FF]">
            <MobileNavItem href="/" label="Home" icon="⌂" />
            <MobileNavItem href="/listings" label="Buy now" icon="▣" />
            <MobileNavItem href="/sell" label="Sell" icon="⊕" />
            <MobileNavItem href="/messages" label="Chats" icon="○" />
            <MobileNavItem href="/account" label="Profile" icon="♙" />
          </nav>
        </div>
      </main>

      <main className="hidden min-h-screen bg-white text-[#4F46E5] md:block hover:bg-[#F5F3FF]">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
          {(desktopTitle || desktopSubtitle) ? (
            <div className="mb-8">
              {desktopTitle ? <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">{desktopTitle}</h1> : null}
              {desktopSubtitle ? <p className="mt-2 max-w-2xl text-base font-semibold text-[#475569]">{desktopSubtitle}</p> : null}
            </div>
          ) : null}
          {desktopChildren || children}
        </div>
      </main>
    </>
  );
}

function MobileNavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-1 rounded-2xl text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5]">
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <section className={cn("rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm", className)}>
      {children}
    </section>
  );
}

export function MobileHeroCard({ children, className }: MobileCardProps) {
  return (
    <section className={cn("rounded-[28px] border border-[#C7D2FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF2FF_100%)] p-4 shadow-[0_18px_50px_rgba(79,70,229,0.10)]", className)}>
      {children}
    </section>
  );
}

export function MobilePrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex h-12 items-center justify-center rounded-xl bg-[#4F46E5] px-4 text-sm font-black text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] !text-white disabled:!text-white">
      {children}
    </Link>
  );
}

export function MobileSecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex h-12 items-center justify-center rounded-xl border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#4F46E5] hover:bg-[#F5F3FF]">
      {children}
    </Link>
  );
}

export function MobileListRow({ href, title, subtitle, icon }: { href: string; title: string; subtitle?: string; icon?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-[#F1F5F9] py-4 last:border-b-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-lg text-[#4F46E5]">
        {icon || "▣"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-[#0F172A]">{title}</div>
        {subtitle ? <div className="truncate text-xs font-semibold text-[#64748B]">{subtitle}</div> : null}
      </div>
      <span className="text-lg font-black text-[#94A3B8]">›</span>
    </Link>
  );
}

export function MobileSectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-end justify-between gap-3">
      <h2 className="text-xl font-black tracking-tight text-[#0F172A]">{title}</h2>
      {action ? <div className="text-xs font-black text-[#4F46E5]">{action}</div> : null}
    </div>
  );
}
