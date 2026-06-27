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
    <div className="mb-6 rounded-[24px] border border-[var(--bd-border)] bg-[#FBF9FF] p-4 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black text-[var(--bd-ink)]">{count} results</p>
          <p className="mt-1 text-xs font-bold text-[var(--bd-muted)]">
            {selectedCategory} · {typeLabel} · {sortLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/listings?sort=newest" className="rounded-full border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">
            Newest
          </Link>
          <Link href="/listings?type=OFFERABLE" className="rounded-full border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">
            Offers
          </Link>
          <Link href="/listings?type=BUY_NOW" className="rounded-full border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">
            Buy Now
          </Link>
          <Link href="/listings" className="rounded-full border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-black text-[var(--bd-purple-dark)] shadow-sm">
            Clear
          </Link>
        </div>
      </div>
    </div>
  );
}