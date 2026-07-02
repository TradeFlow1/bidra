import Link from "next/link";
import type { BidraNavKey } from "./types";

type BidraHeaderProps = {
  activeNav: BidraNavKey;
};

const desktopNav = [
  { key: "home", label: "Home", href: "/" },
  { key: "listings", label: "Listings", href: "/listings" },
  { key: "sell", label: "Sell", href: "/sell/new" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "account", label: "Account", href: "/account" },
] as const;

export function BidraHeader({ activeNav }: BidraHeaderProps) {
  return (
    <header className="bidra-header">
      <div className="bidra-header__inner">
        <Link href="/" className="bidra-wordmark" aria-label="Bidra home">
          Bidra
        </Link>

        <nav className="bidra-header__nav" aria-label="Main navigation">
          {desktopNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`bidra-header__link${activeNav === item.key ? " is-active" : ""}`}
              aria-current={activeNav === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
