import type { ReactNode } from "react";

export function BrowsePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[radial-gradient(760px_320px_at_8%_-120px,rgba(124,58,237,0.10),transparent_72%),linear-gradient(180deg,#FBF9FF_0%,#FFFFFF_58%,#FFFFFF_100%)] px-4 py-5 text-[var(--bd-ink)] sm:px-6 lg:px-8 lg:py-8">
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
    <div className="hidden overflow-hidden rounded-[34px] border border-[#E8E2F4] bg-white shadow-[0_26px_90px_rgba(18,7,36,0.11)] md:grid md:grid-cols-[310px_minmax(0,1fr)]">
      <aside className="border-r border-[#E8E2F4] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFAFF_100%)] px-7 py-8">
        {sidebar}
      </aside>
      <section className="bg-white px-7 py-8 xl:px-8 xl:py-9">
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
