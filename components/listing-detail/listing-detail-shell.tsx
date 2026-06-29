import type { ReactNode } from "react";

export function ListingDetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="bd-listing-detail-page min-h-screen bg-[#FBF9FF] px-4 py-8 text-[#120724] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] pb-24">
        {children}
      </div>
    </main>
  );
}

export function ListingDetailGrid({
  gallery,
  side,
}: {
  gallery: ReactNode;
  side: ReactNode;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start xl:gap-12">
      <div>{gallery}</div>
      <aside className="bd-listing-action-panel lg:sticky lg:top-28 lg:pt-2">{side}</aside>
    </section>
  );
}