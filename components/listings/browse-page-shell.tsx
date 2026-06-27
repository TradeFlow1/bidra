import type { ReactNode } from "react";

export function BrowsePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[var(--bd-bg)] px-4 py-5 text-[var(--bd-ink)] sm:px-6 lg:px-8 lg:py-8">
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
    <div className="hidden overflow-hidden rounded-[34px] border border-[var(--bd-border)] bg-white shadow-[0_24px_80px_rgba(43,16,85,0.10)] md:grid md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-r border-[var(--bd-border)] bg-[#FBF9FF] px-8 py-10">
        {sidebar}
      </aside>
      <section className="bg-white px-8 py-10">
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