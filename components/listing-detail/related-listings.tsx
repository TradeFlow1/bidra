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
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Keep browsing</div>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.045em] text-[#120724]">You may also like</h2>
        </div>
        <Link href="/listings" className="text-sm font-extrabold text-[#6D28D9] hover:underline">
          Browse all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {children}
      </div>
    </section>
  );
}