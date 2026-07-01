import Link from "next/link";
import type { ReactNode } from "react";

export function RelatedListings({
  children,
  hasListings,
}: {
  children: ReactNode;
  hasListings: boolean;
}) {
  if (!hasListings) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Keep browsing</div>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#17131F]">You may also like</h2>
        </div>
        <Link href="/listings" className="text-sm font-semibold text-[#4F475D] hover:text-[#17131F]">
          Browse all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {children}
      </div>
    </section>
  );
}