import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type PublicContentPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

type LegalContentPageProps = {
  title: string;
  updated?: string;
  active: "terms" | "privacy" | "fees" | "prohibited" | "disputes";
  children: ReactNode;
};

type InfoCardProps = {
  title: string;
  body: string;
  href?: string;
  icon?: string;
};

const legalLinks = [
  { key: "terms", href: "/legal/terms", label: "Terms of Use" },
  { key: "privacy", href: "/legal/privacy", label: "Privacy Policy" },
  { key: "fees", href: "/legal/fees", label: "Fees" },
  { key: "prohibited", href: "/legal/prohibited-items", label: "Prohibited Items" },
  { key: "disputes", href: "/disputes", label: "Disputes" },
] as const;

export function PublicContentPage({ title, subtitle, children, className }: PublicContentPageProps) {
  return (
    <main className="bg-white text-[#4F46E5] hover:bg-[#F5F3FF]">
      <div className={cn("mx-auto w-full max-w-[1320px] px-8 py-12 lg:py-16", className)}>
        <header className="max-w-5xl">
          <h1 className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-xl font-black text-[#0F172A]">{subtitle}</p> : null}
        </header>
        <div className="mt-9">{children}</div>
      </div>
    </main>
  );
}

export function LegalContentPage({ title, updated = "Last updated: 1 May 2025", active, children }: LegalContentPageProps) {
  return (
    <main className="bg-white text-[#4F46E5] hover:bg-[#F5F3FF]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="border-[#E2E8F0] lg:border-r lg:pr-8">
          <h1 className="text-2xl font-black tracking-tight">Legal</h1>
          <nav className="mt-7 space-y-3">
            {legalLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "block rounded-xl px-5 py-4 text-base font-semibold text-[#475569] hover:bg-[#F5F3FF] hover:text-[#4F46E5]",
                  active === item.key ? "border-l-4 border-[#4F46E5] bg-[#EEF2FF] font-black text-[#4F46E5]" : ""
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="max-w-5xl">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">{title}</h2>
          <p className="mt-5 text-xl font-semibold text-[#64748B]">{updated}</p>
          <div className="mt-12 space-y-11 text-lg font-semibold leading-8 text-[#475569]">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}

export function TopicGrid({ items }: { items: InfoCardProps[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item) => {
        const content = (
          <div className="flex items-center gap-6 rounded-[18px] border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:border-[#C7D2FE] hover:bg-[#FBFAFF] hover:bg-[#F5F3FF]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-2xl text-[#4F46E5]">
              {item.icon || "□"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#0F172A]">{item.title}</h2>
              <p className="mt-1 text-base font-semibold text-[#64748B]">{item.body}</p>
            </div>
            <span className="ml-auto text-3xl font-semibold text-[#4F46E5]">›</span>
          </div>
        );

        return item.href ? <Link key={item.title} href={item.href}>{content}</Link> : <article key={item.title}>{content}</article>;
      })}
    </div>
  );
}

export function ArticleList({ items }: { items: { href: string; title: string }[] }) {
  return (
    <div className="divide-y divide-[#E2E8F0] overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-sm hover:bg-[#F5F3FF]">
      {items.map((item) => (
        <Link key={item.href + item.title} href={item.href} className="flex items-center gap-5 px-5 py-5 text-base font-semibold text-[#4F46E5] hover:bg-[#F5F3FF]">
          <span className="text-xl">▤</span>
          <span>{item.title}</span>
          <span className="ml-auto text-2xl">›</span>
        </Link>
      ))}
    </div>
  );
}

export function SearchBox({ placeholder = "Search..." }: { placeholder?: string }) {
  return (
    <div className="flex h-16 max-w-5xl items-center gap-4 rounded-2xl border border-[#CBD5E1] bg-white px-6 text-lg font-semibold text-[#64748B] shadow-sm hover:bg-[#F5F3FF]">
      <span className="text-2xl">⌕</span>
      <span>{placeholder}</span>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-2xl font-black text-[#0F172A]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white hover:bg-[#F5F3FF]">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo className="relative block h-12 w-[190px] overflow-visible" />
            <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-[#475569]">Australia&apos;s local marketplace. Buy, sell and discover with ease.</p>
            <div className="mt-5 flex gap-3">
              {["f", "◎", "𝕏"].map((item) => <span key={item} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-black text-[#4F46E5]">{item}</span>)}
            </div>
          </div>
          <FooterColumn title="Marketplace" links={[["Home", "/"], ["Buy now", "/listings"], ["Make an offer", "/listings"], ["Browse categories", "/listings"], ["Sell an item", "/sell"]]} />
          <FooterColumn title="Support" links={[["Help centre", "/help"], ["Contact us", "/contact"], ["Safety tips", "/support"], ["Community guidelines", "/legal/prohibited-items"]]} />
          <FooterColumn title="Legal" links={[["Terms of use", "/legal/terms"], ["Privacy policy", "/legal/privacy"], ["Fees", "/legal/fees"], ["About us", "/about"]]} />
          <div>
            <h3 className="text-sm font-black text-[#0F172A]">Stay in the loop</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#475569]">Get tips, new features and updates.</p>
            <input className="mt-5 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Enter your email" />
            <button className="mt-3 h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white !text-white disabled:!text-white">Subscribe</button>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 text-xs font-semibold text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
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
        {links.map(([label, href]) => <Link key={label} href={href} className="block text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">{label}</Link>)}
      </div>
    </div>
  );
}

