import Link from "next/link";
import ConceptSearch from "./ConceptSearch";

type HeaderKey = "home" | "listings" | "sell" | "messages";

type ConceptHeaderProps = {
  active?: HeaderKey;
};

const links: Array<{ key: HeaderKey; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/concept" },
  { key: "listings", label: "Listings", href: "/concept/listings" },
  { key: "sell", label: "Sell", href: "/concept/sell" },
  { key: "messages", label: "Messages", href: "/concept/messages" },
];

export default function ConceptHeader({ active = "home" }: ConceptHeaderProps) {
  return (
    <header className="cm-header" aria-label="Concept header">
      <div className="cm-header-inner">
        <Link href="/concept" className="cm-brand" aria-label="Bidra concept home">
          <span className="cm-brand-dot" />
          <span className="cm-brand-word">Bidra</span>
          <span className="cm-brand-sub">Australia marketplace</span>
        </Link>

        <div className="cm-header-search">
          <ConceptSearch placeholder="Search furniture, electronics, tools, and more" />
        </div>

        <div className="cm-header-right">
          <nav className="cm-nav" aria-label="Primary navigation">
            {links.map((item) => (
              <Link key={item.key} href={item.href} className={item.key === active ? "cm-nav-link cm-nav-link-active" : "cm-nav-link"}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="cm-header-actions" aria-label="Header actions">
            <Link href="/concept/listings" className="cm-action-link">Watchlist</Link>
            <Link href="/concept/messages" className="cm-action-link">Inbox</Link>
            <Link href="/concept/sell" className="cm-btn cm-btn-primary">Sell your item</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
