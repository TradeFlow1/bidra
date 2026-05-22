import Link from "next/link";

export function BidraMobileHeader() {
  return (
    <header className="sticky top-0 z-[100] border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-black tracking-tight text-[#0F172A]">Bidra</Link>
        <Link href="/sell/new" className="rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-4 py-2 text-xs font-black text-white shadow-sm">Sell</Link>
      </div>
    </header>
  );
}