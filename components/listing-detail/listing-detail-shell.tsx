import type { ReactNode } from "react";

export function ListingDetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#FCFBFE] px-4 py-4 text-[#17131F] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px] pb-20">
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
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_400px] lg:items-start xl:gap-7">
      <div className="rounded-[24px] border border-[#E8E2EF] bg-white p-2 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-3">{gallery}</div>
      <aside className="lg:sticky lg:top-24">{side}</aside>
    </section>
  );
}
