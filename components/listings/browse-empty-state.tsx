import Link from "next/link";
import { anchorButtonClassName } from "@/components/ui";

export function BrowseEmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#C4B5FD] bg-[#FBF9FF] px-8 py-14 text-center">
      <h2 className="text-xl font-black text-[var(--bd-ink)]">No listings match these filters</h2>
      <p className="mt-2 text-sm font-semibold text-[var(--bd-muted)]">Clear filters to search all Australia, or try a broader keyword/category.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/listings" className={anchorButtonClassName("secondary", "md")}>Clear filters</Link>
        <Link href="/sell/new" className={anchorButtonClassName("primary", "md")}>Sell an item</Link>
      </div>
    </div>
  );
}