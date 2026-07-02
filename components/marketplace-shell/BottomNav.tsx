import Link from "next/link";
import type { ShellNavKey } from "./types";

type BottomNavProps = {
  active?: ShellNavKey;
};

const items: Array<{ key: ShellNavKey; label: string; href: string }> = [
  { key: "home", label: "Search", href: "/" },
  { key: "browse", label: "Browse", href: "/listings" },
  { key: "sell", label: "Sell", href: "/sell/new" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "wanted", label: "Wanted", href: "/wanted" },
];

const icons: Record<ShellNavKey, string> = {
  home: "S",
  browse: "B",
  offers: "O",
  "buy-now": "N",
  wanted: "W",
  sell: "S",
  messages: "M",
  account: "A",
};

export default function BottomNav({ active = "home" }: BottomNavProps) {
  return (
    <nav aria-label="Mobile primary navigation">
      {items.map((item) => (
        <Link key={item.key} href={item.href} aria-current={item.key === active ? "page" : undefined}>
          <span aria-hidden="true">{icons[item.key]}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
