import Link from "next/link";
import SearchBar from "./SearchBar";
import type { ShellNavKey } from "./types";

type HeaderProps = {
  active?: ShellNavKey;
};

const links: Array<{ key: ShellNavKey; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/" },
  { key: "browse", label: "Browse", href: "/listings" },
  { key: "sell", label: "Sell", href: "/sell/new" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "account", label: "Account", href: "/dashboard" },
];

export default function Header({ active = "home" }: HeaderProps) {
  return (
    <header className="mk-header mk-desktop-header" aria-label="Main header">
      <div className="mk-header-inner">
        <Link href="/" className="mk-brand" aria-label="Bidra home">
          <span className="mk-brand-dot" />
          <span>Bidra</span>
        </Link>

        <SearchBar />

        <nav className="mk-nav" aria-label="Desktop navigation">
          {links.map((item) => (
            <Link key={item.key} href={item.href} className={item.key === active ? "mk-nav-link mk-nav-link-active" : "mk-nav-link"}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
