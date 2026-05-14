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
    <nav className="rounded-[24px] border border-[#D7E2F1] bg-white p-2 shadow-[0_14px_45px_rgba(28,50,84,0.08)]" aria-label="My Bidra navigation">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={
                "rounded-2xl px-3 py-3 text-center text-xs font-extrabold transition sm:text-sm " +
                (selected
                  ? "bg-[#0B4DFF] text-white shadow-[0_10px_24px_rgba(11,77,255,0.24)]"
                  : "bg-[#F8FAFF] text-[#14213D] hover:bg-[#EEF4FF] hover:text-[#0B4DFF]")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
