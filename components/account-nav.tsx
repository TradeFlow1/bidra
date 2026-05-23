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
    <nav className="bd-account-nav" aria-label="Account navigation">
      {accountNavItems.map((item) => {
        const isActive = item.key === active;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "bd-account-nav-link bd-account-nav-link-active" : "bd-account-nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}