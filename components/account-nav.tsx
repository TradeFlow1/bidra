import Link from "next/link";

type AccountNavKey = "selling" | "buying" | "messages" | "saved" | "updates" | "account";

const accountNavItems: { key: AccountNavKey; label: string; href: string }[] = [
  { key: "selling", label: "Selling", href: "/account#listings" },
  { key: "buying", label: "Buying", href: "/orders" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "saved", label: "Saved", href: "/watchlist" },
  { key: "updates", label: "Updates", href: "/notifications" },
  { key: "account", label: "Account", href: "/account#account" },
];

export default function AccountNav({ active }: { active?: AccountNavKey }) {
  return (
    <nav className="rounded-full border border-[#E7DEF4] bg-[#FCFBFF] p-2 shadow-[0_16px_36px_rgba(18,7,36,0.06)]" aria-label="Account navigation">
      <div className="flex flex-wrap gap-2">
        {accountNavItems.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive
                ? "rounded-full bg-[#7C3AED] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)] transition"
                : "rounded-full px-4 py-2.5 text-sm font-black text-[#4F4660] transition hover:bg-[#F5F3FF] hover:text-[#5B21B6]"}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
