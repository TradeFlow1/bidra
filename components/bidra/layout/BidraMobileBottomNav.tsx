import Link from "next/link";

const items = [
  ["Home", "/"],
  ["Buy now", "/listings"],
  ["Sell", "/sell/new"],
  ["Chats", "/messages"],
  ["Profile", "/account"],
] as const;

export function BidraMobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#D8E1F0] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden" aria-label="Primary mobile navigation">
      <ul className="grid grid-cols-5 gap-1 text-center text-[11px] font-extrabold text-[#334155]">
        {items.map(([label, href]) => (
          <li key={href}>
            <Link className="block rounded-2xl px-2 py-2 hover:bg-[#EEF2FF]" href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}