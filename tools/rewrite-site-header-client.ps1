"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SearchBar from "./search-bar";

type SessionLike = {
  user?: {
    id?: string;
  } | null;
} | null | undefined;

export default function SiteHeaderClient({
  session,
  notificationCount = 0,
}: {
  session?: SessionLike;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [desktopAcctOpen, setDesktopAcctOpen] = useState(false);
  const [mobileAcctOpen, setMobileAcctOpen] = useState(false);
  const desktopAccountRef = useRef<HTMLDivElement | null>(null);
  const mobileAccountRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = !!session?.user?.id;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;

      if (desktopAccountRef.current && target && !desktopAccountRef.current.contains(target)) {
        setDesktopAcctOpen(false);
      }

      if (mobileAccountRef.current && target && !mobileAccountRef.current.contains(target)) {
        setMobileAcctOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDesktopAcctOpen(false);
        setMobileAcctOpen(false);
      }
    }

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  function isActive(href: string) {
    if (!pathname) { return false; }
    return pathname === href || pathname.startsWith(href + "/");
  }

  function navButtonClass(href: string) {
    if (isActive(href)) {
      return "inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/14 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/18";
    }
    return "inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/8 px-4 py-2 text-[13px] font-medium text-white/92 transition hover:bg-white/12 hover:text-white";
  }

  function accountButtonClass(isOpen: bool) {
    if (isOpen) {
      return "inline-flex items-center justify-center rounded-xl border border-white/18 bg-white px-4 py-2 text-[13px] font-semibold text-[#0B1220] transition hover:bg-white/92";
    }
    return "inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/8 px-4 py-2 text-[13px] font-medium text-white/92 transition hover:bg-white/12 hover:text-white";
  }

  const searchInputClass = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none placeholder:text-neutral-500 focus:border-black/20";
  const menuLinkClass = "block w-full px-4 py-3 text-left text-[13px] font-medium text-[#0F172A] transition hover:bg-black/5";

  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[11px] font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div
        className="absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>
          Dashboard
        </Link>
        <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>
          Orders
        </Link>
        <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>
          Messages
        </Link>
        <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>
          Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
        </Link>
        <div className="border-t border-black/10">
          <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>
            Sign out
          </Link>
        </div>
      </div>
    );
  }

  return (
    <header className="relative z-[80] border-b border-white/10 bg-[linear-gradient(180deg,#0B1220_0%,#18243D_100%)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3">
        <div className="shrink-0">
          <Link href="/" className="inline-flex items-center rounded-lg px-1 py-1 text-white transition hover:opacity-95">
            <span className="text-[22px] font-bold tracking-tight">Bidra</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-3 md:flex">
          <Link href="/listings" className={navButtonClass("/listings")}>Browse</Link>
          <Link href="/sell" className={navButtonClass("/sell")}>Sell</Link>
        </nav>

        <div className="hidden min-w-0 flex-1 md:flex md:justify-center">
          <SearchBar
            className="w-full max-w-sm"
            inputClassName={searchInputClass}
            placeholder="Search listings"
          />
        </div>

        <div className="ml-auto hidden md:flex md:items-center">
          {isAuthed ? (
            <div ref={desktopAccountRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesktopAcctOpen(!desktopAcctOpen);
                }}
                className={accountButtonClass(desktopAcctOpen)}
                aria-haspopup="menu"
                aria-expanded={desktopAcctOpen ? "true" : "false"}
              >
                Account
                {badge}
              </button>
              {desktopAcctOpen ? renderAccountMenu(() => setDesktopAcctOpen(false)) : null}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className={navButtonClass("/auth/login")}>Sign in</Link>
              <Link href="/auth/register" className={navButtonClass("/auth/register")}>Create account</Link>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Link href="/listings" className={navButtonClass("/listings")}>Browse</Link>
          <Link href="/sell" className={navButtonClass("/sell")}>Sell</Link>

          {isAuthed ? (
            <div ref={mobileAccountRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileAcctOpen(!mobileAcctOpen);
                }}
                className={accountButtonClass(mobileAcctOpen)}
                aria-haspopup="menu"
                aria-expanded={mobileAcctOpen ? "true" : "false"}
              >
                Account
                {badge}
              </button>
              {mobileAcctOpen ? renderAccountMenu(() => setMobileAcctOpen(false)) : null}
            </div>
          ) : (
            <Link href="/auth/login" className={navButtonClass("/auth/login")}>Sign in</Link>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 pb-3 md:hidden">
        <div className="mx-auto max-w-6xl pt-3">
          <SearchBar
            className="w-full"
            inputClassName={searchInputClass}
            placeholder="Search listings"
          />
        </div>
      </div>
    </header>
  );
}
