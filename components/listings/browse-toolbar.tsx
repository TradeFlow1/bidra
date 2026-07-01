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
    <div className="mb-5 overflow-hidden rounded-[24px] border border-[#E8E2EF] bg-[#FCFBFE] p-4 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-black tracking-[-0.035em] text-[var(--bd-ink)]">{count} curated results</p>
          <p className="mt-1 text-xs font-bold text-[var(--bd-muted)]">
            {selectedCategory} • {typeLabel} • {sortLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/listings?sort=newest" className="rounded-full border border-[#E8E2EF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4F475D] shadow-sm transition hover:border-[#D9CEE9] hover:bg-[#F7F5FA]">
            Newest
          </Link>
          <Link href="/listings?type=OFFERABLE" className="rounded-full border border-[#E8E2EF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4F475D] shadow-sm transition hover:border-[#D9CEE9] hover:bg-[#F7F5FA]">
            Offers
          </Link>
          <Link href="/listings?type=BUY_NOW" className="rounded-full border border-[#E8E2EF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4F475D] shadow-sm transition hover:border-[#D9CEE9] hover:bg-[#F7F5FA]">
            Buy Now
          </Link>
          <Link href="/listings" className="rounded-full border border-[#E8E2EF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4F475D] shadow-sm transition hover:border-[#D9CEE9] hover:bg-[#F7F5FA]">
            Clear
          </Link>
        </div>
      </div>
    </div>
  );
}