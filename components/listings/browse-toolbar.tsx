import Link from "next/link";

export function BrowseToolbar({
  count,
  selectedSort,
  selectedType,
  selectedCategory,
}: {
  count: number;
  selectedSort: string;
  selectedType: string;
  selectedCategory: string;
}) {
  const sortLabel =
    selectedSort === "price-low"
      ? "Price low to high"
      : selectedSort === "price-high"
        ? "Price high to low"
        : "Newest first";

  const typeLabel =
    selectedType === "BUY_NOW"
      ? "Buy Now"
      : selectedType === "OFFERABLE"
        ? "Offers"
        : "All sale types";

  return (
    <div className="mb-6 rounded-[26px] border border-[var(--bd-border)] bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_62%,#F5F3FF_100%)] p-4 shadow-[0_18px_55px_rgba(43,16,85,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-black tracking-[-0.035em] text-[var(--bd-ink)]">{count} results</p>
          <p className="mt-1 text-xs font-bold text-[var(--bd-muted)]">
            {selectedCategory} Â· {typeLabel} Â· {sortLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/listings?sort=newest" className="rounded-full border border-[#DDD6FE] bg-white px-3.5 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm transition hover:border-[#C4B5FD] hover:bg-[var(--bd-purple-soft)]">
            Newest
          </Link>
          <Link href="/listings?type=OFFERABLE" className="rounded-full border border-[#DDD6FE] bg-white px-3.5 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm transition hover:border-[#C4B5FD] hover:bg-[var(--bd-purple-soft)]">
            Offers
          </Link>
          <Link href="/listings?type=BUY_NOW" className="rounded-full border border-[#DDD6FE] bg-white px-3.5 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm transition hover:border-[#C4B5FD] hover:bg-[var(--bd-purple-soft)]">
            Buy Now
          </Link>
          <Link href="/listings" className="rounded-full border border-[#DDD6FE] bg-white px-3.5 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm transition hover:border-[#C4B5FD] hover:bg-[var(--bd-purple-soft)]">
            Clear
          </Link>
        </div>
      </div>
    </div>
  );
}