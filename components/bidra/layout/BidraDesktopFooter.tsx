import Link from "next/link";

export function BidraDesktopFooter() {
  return (
    <footer className="border-t border-[#D8E1F0] bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-[#475569] sm:px-6 lg:px-8">
        <p className="font-semibold">© {new Date().getFullYear()} Bidra</p>
        <nav className="flex flex-wrap gap-4 font-semibold">
          <Link href="/help">Help</Link>
          <Link href="/support">Support</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}