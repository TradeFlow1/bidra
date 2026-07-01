import Link from "next/link";
import type { ReactNode } from "react";

export function BrowseFilterPanel({
  title = "Filters",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="sticky top-28">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bd-purple)]">Refine results</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)]">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--bd-muted)]">
          Narrow listings by type, price, location and handover.
        </p>
      </div>

      <div className="rounded-[28px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_16px_45px_rgba(43,16,85,0.08)]">
        {children}
      </div>
    </div>
  );
}

export function BrowseCategoryNav({
  categories,
  selectedCategory,
  categoryHref,
}: {
  categories: string[];
  selectedCategory: string;
  categoryHref: (category: string) => string;
}) {
  return (
    <nav className="grid gap-2" aria-label="Listing categories">
      {categories.map((category) => {
        const active = category === selectedCategory;
        return (
          <Link
            key={category}
            href={categoryHref(category)}
            className={
              active
                ? "rounded-[18px] border border-[#DDD6FE] bg-[var(--bd-purple-soft)] px-4 py-3 text-sm font-black text-[var(--bd-purple-dark)] shadow-sm"
                : "rounded-[18px] border border-transparent bg-white/70 px-4 py-3 text-sm font-bold text-[var(--bd-muted)] transition hover:border-[#DDD6FE] hover:bg-white hover:text-[var(--bd-purple-dark)]"
            }
          >
            {category}
          </Link>
        );
      })}
    </nav>
  );
}

export function BrowseMobileHero({
  count,
  selectedCategory,
}: {
  count: number;
  selectedCategory: string;
}) {
  return (
    <section className="px-4 pb-5 pt-4">
      <div className="overflow-hidden rounded-[30px] border border-[#DDD6FE] bg-gradient-to-br from-white via-[#FBF9FF] to-[#F5F3FF] p-5 shadow-[0_18px_45px_rgba(43,16,85,0.09)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--bd-purple)]">Marketplace</p>
        <h1 className="mt-3 text-4xl font-black leading-[0.92] tracking-[-0.065em] text-[var(--bd-ink)]">Browse listings</h1>
        <p className="mt-3 max-w-[290px] text-sm font-semibold leading-6 text-[var(--bd-muted)]">
          {count} results. Filter fast, compare clearly, then tap a listing to inspect it.
        </p>
      </div>

      <p className="mt-4 rounded-full border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">
        {selectedCategory}
      </p>
    </section>
  );
}

export function BrowsePaginationNotice({ pageSize }: { pageSize: number }) {
  return (
    <div className="mt-12 rounded-[22px] border border-[var(--bd-border)] bg-[#FBF9FF] px-5 py-4 text-center text-sm font-semibold text-[var(--bd-muted)]">
      More than {pageSize} listings found. Page controls can be enabled when server-side page query support is added.
    </div>
  );
}