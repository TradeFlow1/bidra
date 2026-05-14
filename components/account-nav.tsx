import Link from "next/link";

type AccountNavProps = {
  active?: "selling" | "buying" | "messages" | "saved" | "updates" | "account";
};

const items = [
  { key: "selling", label: "Selling", href: "/dashboard/listings" },
  { key: "buying", label: "Buying", href: "/orders" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "saved", label: "Saved", href: "/watchlist" },
  { key: "updates", label: "Updates", href: "/notifications" },
  { key: "account", label: "Account", href: "/dashboard#account-status" },
] as const;

export default function AccountNav({ active }: AccountNavProps) {
  return (
    <nav className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              "rounded-2xl border px-3 py-3 text-center text-xs font-extrabold shadow-sm transition sm:text-sm " +
              (selected
                ? "border-[#0B4DFF] bg-[#0B4DFF] text-white"
                : "border-black/10 bg-white text-[#0F172A] hover:bg-black/5")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
