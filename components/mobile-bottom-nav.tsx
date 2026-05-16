"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIcon = "home" | "buy" | "sell" | "chat" | "profile";

const items: Array<{ href: string; label: string; icon: NavIcon; match: (p: string) => boolean }> = [
  { href: "/", label: "Home", icon: "home", match: (p: string) => p === "/" },
  { href: "/listings", label: "Browse", icon: "buy", match: (p: string) => p === "/listings" || p.startsWith("/listings/") || p.startsWith("/browse") },
  { href: "/sell/new", label: "Sell", icon: "sell", match: (p: string) => p.startsWith("/sell") },
  { href: "/messages", label: "Messages", icon: "chat", match: (p: string) => p.startsWith("/messages") },
  { href: "/dashboard", label: "Account", icon: "profile", match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/orders") || p.startsWith("/watchlist") || p.startsWith("/notifications") || p.startsWith("/account") || p.startsWith("/seller") },
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

function Icon({ name }: { name: NavIcon }) {
  const common = "h-5 w-5";
  if (name === "home") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" /></svg>;
  if (name === "buy") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>;
  if (name === "sell") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "chat") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 6.5h14v9H8l-3 3v-12Z" /></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const isEnabled = enabledPrefixes.some((prefix) => prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix + "/"));
  const isBlocked = pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  if (!isEnabled || isBlocked) return null;

  return (
    <nav className="bd-mobile-bottom-nav fixed inset-x-0 bottom-0 z-[110] grid grid-cols-5 gap-1 px-2 pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden" aria-label="Primary mobile navigation" data-mobile-bottom-nav>
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link key={item.href} href={item.href} className={"bd-bottom-nav-item flex min-h-[52px] w-full flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black" + (active ? " bd-bottom-nav-item-active" : "")}>
            <span className="bd-bottom-nav-icon" aria-hidden="true"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}





