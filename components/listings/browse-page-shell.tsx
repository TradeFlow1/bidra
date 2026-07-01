import type { ReactNode } from "react";

export function BrowsePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#FCFBFE] px-4 py-4 text-[#17131F] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1440px]">
        {children}
      </div>
    </main>
  );
}

export function BrowseDesktopLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="hidden overflow-hidden rounded-[28px] border border-[#E8E2EF] bg-white shadow-[0_12px_32px_rgba(15,12,22,0.05)] md:grid md:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-r border-[#E8E2EF] bg-[#FCFBFE] px-6 py-7">
        {sidebar}
      </aside>
      <section className="bg-white px-6 py-7 xl:px-8 xl:py-8">
        {children}
      </section>
    </div>
  );
}

export function BrowseMobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:hidden">
      {children}
    </div>
  );
}
