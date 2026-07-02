import Link from "next/link";
import type { BidraNavKey } from "./types";

type BidraMobileNavProps = {
  activeNav: BidraNavKey;
};

const mobileNav = [
  { key: "home", label: "Home", href: "/" },
  { key: "listings", label: "Listings", href: "/listings" },
  { key: "sell", label: "Sell", href: "/sell/new" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "account", label: "Account", href: "/account" },
] as const;

export function BidraMobileNav({ activeNav }: BidraMobileNavProps) {
  return (
    <nav className="bidra-mobile-nav" aria-label="Mobile navigation">
      {mobileNav.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`bidra-mobile-nav__item${activeNav === item.key ? " is-active" : ""}`}
          aria-current={activeNav === item.key ? "page" : undefined}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
