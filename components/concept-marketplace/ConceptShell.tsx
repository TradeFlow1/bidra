import type { ReactNode } from "react";
import Link from "next/link";
import ConceptHeader from "./ConceptHeader";

type ConceptNavKey = "home" | "listings" | "sell" | "messages";

type ConceptShellProps = {
  children: ReactNode;
  title: string;
  active?: ConceptNavKey;
};

const mobileNav: Array<{ key: ConceptNavKey; label: string; href: string }> = [
  { key: "home", label: "Search", href: "/concept" },
  { key: "listings", label: "Listings", href: "/concept/listings" },
  { key: "sell", label: "Sell", href: "/concept/sell" },
  { key: "messages", label: "Messages", href: "/concept/messages" },
];

export default function ConceptShell({ children, title, active = "home" }: ConceptShellProps) {
  return (
    <div className="cm-shell">
      <ConceptHeader active={active} />
      <header className="cm-mobile-header" aria-label="Mobile concept header">
        <p className="cm-mobile-title">{title}</p>
        <Link href="/concept/sell" className="cm-mobile-sell">Sell</Link>
      </header>
      <main className="cm-main">{children}</main>
      <nav className="cm-bottom-nav" aria-label="Mobile concept navigation">
        {mobileNav.map((item) => (
          <Link key={item.key} href={item.href} className={item.key === active ? "cm-bottom-link cm-bottom-link-active" : "cm-bottom-link"}>
            <span className="cm-bottom-dot" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
