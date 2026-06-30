import type { ReactNode } from "react";

export function ListingDetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(760px_320px_at_10%_-120px,rgba(124,58,237,0.12),transparent_70%),linear-gradient(180deg,#FAF7FF_0%,#F7F3FF_100%)] px-4 py-6 text-[#120724] sm:px-6 lg:px-10 lg:py-8">
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
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_440px] lg:items-start xl:gap-10">
      <div className="rounded-[28px] border border-[#E8E2F4] bg-white p-3 shadow-[0_22px_70px_rgba(18,7,36,0.08)] sm:p-4">{gallery}</div>
      <aside className="lg:sticky lg:top-28">{side}</aside>
    </section>
  );
}
