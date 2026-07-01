import Link from "next/link";
import type { ShellNavKey } from "./types";

type BottomNavProps = {
  active?: ShellNavKey;
};

const items: Array<{ key: ShellNavKey; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/" },
  { key: "browse", label: "Browse", href: "/listings" },
  { key: "sell", label: "Sell", href: "/sell/new" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "account", label: "Account", href: "/dashboard" },
];

export default function BottomNav({ active = "home" }: BottomNavProps) {
  return (
    <nav className="mk-bottom-nav" aria-label="Mobile primary navigation">
      {items.map((item) => (
        <Link key={item.key} href={item.href} className={item.key === active ? "mk-bottom-item mk-bottom-item-active" : "mk-bottom-item"}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
