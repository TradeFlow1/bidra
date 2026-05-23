import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type DesktopMarketplacePageProps = {
  children: ReactNode;
  className?: string;
  active?: "home" | "buy" | "offer" | "categories" | "sell" | "signin";
};

type DesktopFooterProps = {
  compact?: boolean;
};

const navItems = [
  { href: "/", label: "Home", key: "home" },
  { href: "/listings", label: "Buy now", key: "buy" },
  { href: "/listings", label: "Make an offer", key: "offer" },
  { href: "/listings", label: "Categories", key: "categories" },
];

export function DesktopMarketplacePage({ children, className, active }: DesktopMarketplacePageProps) {
  return (
    <main className="hidden min-h-screen bg-white text-[#4F46E5] md:block hover:bg-[#F5F3FF]">
      <DesktopMarketplaceHeader active={active} />
      <div className={cn("mx-auto w-full max-w-7xl px-8 py-10", className)}>{children}</div>
      <DesktopMarketplaceFooter />
    </main>
  );
}

export function DesktopMarketplaceHeader({ active }: { active?: DesktopMarketplacePageProps["active"] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur hover:bg-[#F5F3FF]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-8 px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo className="relative block h-12 w-[190px] overflow-visible" priority />
        </Link>

        <nav className="flex items-center gap-7 text-sm font-black text-[#0F172A]">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative py-2 hover:text-[#4F46E5]",
                active === item.key ? "text-[#4F46E5] after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#4F46E5]" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <Link
            href="/listings"
            className="hidden h-12 w-[360px] items-center justify-between rounded-2xl border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#64748B] shadow-sm lg:flex hover:bg-[#F5F3FF]"
          >
            <span>Search listings...</span>
            <span className="text-xl text-[#0F172A]">⌕</span>
          </Link>
          <Link href="/sell" className="text-sm font-black text-[#0F172A] hover:text-[#4F46E5]">Sell</Link>
          <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] hover:bg-[#4338CA] !text-white disabled:!text-white">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

export function DesktopMarketplaceFooter({ compact = false }: DesktopFooterProps) {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white hover:bg-[#F5F3FF]">
      <div className={cn("mx-auto w-full max-w-7xl px-8", compact ? "py-10" : "py-14")}>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo className="relative block h-14 w-[220px] overflow-visible" />
            <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-[#475569]">
              Australia&apos;s local marketplace. Buy, sell and discover deals nearby.
            </p>
            <div className="mt-5 flex gap-3">
              {["f", "◎", "𝕏"].map((item) => (
                <span key={item} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-black text-[#4F46E5]">{item}</span>
              ))}
            </div>
          </div>

          <FooterColumn title="Marketplace" links={[
            ["Home", "/"],
            ["Buy now", "/listings"],
            ["Make an offer", "/listings"],
            ["Browse categories", "/listings"],
            ["Sell an item", "/sell"],
          ]} />
          <FooterColumn title="Support" links={[
            ["Help centre", "/help"],
            ["Contact us", "/contact"],
            ["Safety tips", "/support"],
            ["Community guidelines", "/legal/prohibited-items"],
          ]} />
          <FooterColumn title="Legal" links={[
            ["Terms of use", "/legal/terms"],
            ["Privacy policy", "/legal/privacy"],
            ["Fees", "/legal/fees"],
            ["Prohibited items", "/legal/prohibited-items"],
          ]} />

          <div>
            <h3 className="text-sm font-black text-[#0F172A]">Stay in the loop</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#475569]">Get the best local deals and updates.</p>
            <div className="mt-5 flex gap-2">
              <input className="h-12 min-w-0 flex-1 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#475569]" placeholder="Enter your email" />
              <button className="h-12 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black text-white !text-white disabled:!text-white">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 text-xs font-semibold text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup and handover directly.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-black text-[#0F172A]">{title}</h3>
      <div className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <Link key={label} href={href} className="block text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DesktopCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-[24px] border border-[#E2E8F0] bg-white shadow-sm", className)}>{children}</section>;
}

export function DesktopProductCard({ title, price, location, icon }: { title: string; price: string; location: string; icon: string }) {
  return (
    <Link href="/listings" className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(79,70,229,0.14)] hover:bg-[#F5F3FF]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-[#F8FAFC] text-5xl text-[#4F46E5]">
        {icon}
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4F46E5] shadow-sm hover:bg-[#F5F3FF]">♡</span>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-black text-[#0F172A]">{title}</h3>
        <p className="mt-2 text-base font-black text-[#0F172A]">{price}</p>
        <p className="mt-4 truncate text-xs font-semibold text-[#64748B]">{location}</p>
      </div>
    </Link>
  );
}

