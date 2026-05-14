"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "⌂", match: (p: string) => p === "/" },
  { href: "/listings", label: "Buy now", icon: "▣", match: (p: string) => p === "/listings" || p.startsWith("/listings/") || p.startsWith("/browse") },
  { href: "/sell/new", label: "Sell", icon: "+", match: (p: string) => p.startsWith("/sell") },
  { href: "/messages", label: "Chats", icon: "○", match: (p: string) => p.startsWith("/messages") },
  { href: "/dashboard", label: "Profile", icon: "♙", match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/orders") || p.startsWith("/watchlist") || p.startsWith("/notifications") || p.startsWith("/account") || p.startsWith("/seller") },
];

const enabledPrefixes = [
  "/",
  "/listings",
  "/browse",
  "/sell",
  "/dashboard",
  "/orders",
  "/messages",
  "/watchlist",
  "/notifications",
  "/account",
  "/seller",
  "/support",
  "/help",
  "/legal",
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const isEnabled = enabledPrefixes.some((prefix) => prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix + "/"));
  const isBlocked = pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  if (!isEnabled || isBlocked) return null;

  return (
    <nav className="bd-bottom-nav md:hidden" aria-label="Primary mobile navigation">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link key={item.href} href={item.href} className={"bd-bottom-nav-item" + (active ? " bd-bottom-nav-item-active" : "")}>
            <span className="bd-bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
