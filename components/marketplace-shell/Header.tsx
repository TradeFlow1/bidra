import Link from "next/link";
import SearchBar from "./SearchBar";
import type { ShellNavKey } from "./types";

type HeaderProps = {
  active?: ShellNavKey;
};

const links: Array<{ key: ShellNavKey; label: string; href: string }> = [
  { key: "browse", label: "Browse", href: "/listings" },
  { key: "offers", label: "Offers", href: "/messages" },
  { key: "buy-now", label: "Buy Now", href: "/listings" },
  { key: "wanted", label: "Wanted", href: "/wanted" },
  { key: "sell", label: "Sell", href: "/sell/new" },
];

const actions: Array<{ key: ShellNavKey; label: string; href: string }> = [
  { key: "account", label: "Watchlist", href: "/watchlist" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "account", label: "Account", href: "/dashboard" },
];

export default function Header({ active = "home" }: HeaderProps) {
  return (
    <header className="mk-header mk-desktop-header" aria-label="Main header">
      <div className="mk-header-inner">
        <div className="mk-brand-wrap">
          <Link href="/" className="mk-brand" aria-label="Bidra home">
            <span className="mk-brand-dot" />
            <span className="mk-brand-wordmark">Bidra</span>
          </Link>
          <p className="mk-brand-subline">Australia marketplace</p>
        </div>

        <div className="mk-header-search-wrap">
          <SearchBar placeholder="Search listings" locationPlaceholder="Australia" />
        </div>

        <div className="mk-header-right">
          <nav className="mk-nav" aria-label="Desktop navigation">
            {links.map((item) => (
              <Link key={item.key} href={item.href} className={item.key === active ? "mk-nav-link mk-nav-link-active" : "mk-nav-link"}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav className="mk-actions" aria-label="Desktop account actions">
            {actions.map((item) => (
              <Link key={`${item.label}-${item.href}`} href={item.href} className="mk-action-link">
                {item.label}
              </Link>
            ))}
            <Link href="/sell/new" className="mk-header-cta">
              Sell your item
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
