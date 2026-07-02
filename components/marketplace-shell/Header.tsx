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
    <header aria-label="Main header">
      <div>
        <div>
          <Link href="/" aria-label="Bidra home">Bidra</Link>
          <p>Australia marketplace</p>
        </div>

        <div>
          <SearchBar placeholder="Search listings" locationPlaceholder="Australia" />
        </div>

        <div>
          <nav aria-label="Desktop navigation">
            {links.map((item) => (
              <Link key={item.key} href={item.href} aria-current={item.key === active ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Desktop account actions">
            {actions.map((item) => (
              <Link key={`${item.label}-${item.href}`} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/sell/new">Sell your item</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
