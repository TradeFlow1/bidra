"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SearchBar from "./search-bar";

type SessionLike = {
  user?: {
    id?: string;
  } | null;
} | null | undefined;

const LOGO_SRC = "/brand/bidra-kangaroo-logo.png";

export default function SiteHeaderClient({
  session,
  notificationCount = 0,
}: {
  session?: SessionLike;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [desktopAcctOpen, setDesktopAcctOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopAccountRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = !!session?.user?.id;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;

      if (desktopAccountRef.current && target && !desktopAccountRef.current.contains(target)) {
        setDesktopAcctOpen(false);
      }

      if (mobileMenuRef.current && target && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDesktopAcctOpen(false);
        setMobileMenuOpen(false);
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
      return "inline-flex h-10 items-center justify-center rounded-full border border-white/25 bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-white/95";
    }
    return "inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/84 px-4 text-[13px] font-medium text-[#0F172A] shadow-sm transition hover:bg-white";
  }

  function accountButtonClass(isOpen: boolean) {
    if (isOpen) {
      return "inline-flex h-10 items-center justify-center rounded-full border border-white/30 bg-[#0F172A] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#111827]";
    }
    return "inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/88 px-4 text-[13px] font-medium text-[#0F172A] shadow-sm transition hover:bg-white";
  }

  const searchInputClass = "w-full rounded-full border border-white/16 bg-white px-4 py-2 text-sm text-black outline-none placeholder:text-neutral-500 shadow-sm focus:border-white/30";
  const menuLinkClass = "block w-full px-4 py-3 text-left text-[13px] font-medium text-[#0F172A] transition hover:bg-black/5";

  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[11px] font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div
        className="absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0F172A] shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>Dashboard</Link>
        <Link href="/profile" className={menuLinkClass} onClick={closeMenu}>Profile</Link>
        <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>Orders</Link>
        <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>Messages</Link>
        <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>
          Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
        </Link>
        <div className="border-t border-black/10">
          <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>Sign out</Link>
        </div>
      </div>
    );
  }

  function renderMobileMenu() {
    return (
      <div
        className="absolute right-0 top-full z-[120] mt-3 w-[min(92vw,22rem)] overflow-hidden rounded-3xl border border-black/10 bg-white text-[#0F172A] shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black/10 bg-neutral-50 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Bidra</div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">{isAuthed ? "Your marketplace menu" : "Browse and sell"}</div>
        </div>

        <div className="p-2">
          <Link href="/listings" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Browse</Link>
          <Link href="/sell" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Sell</Link>

          {isAuthed ? (
            <>
              <Link href="/dashboard" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/messages" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link href="/orders" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link href="/notifications" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
              </Link>
              <Link href="/profile" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <div className="border-t border-black/10 mt-2 pt-2">
                <Link href="/logout" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Sign out</Link>
              </div>
            </>
          ) : (
            <div className="border-t border-black/10 mt-2 p-2">
              <div className="grid grid-cols-1 gap-2">
                <Link href="/auth/login" className="bd-btn bd-btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                <Link href="/auth/register" className="bd-btn bd-btn-ghost text-center" onClick={() => setMobileMenuOpen(false)}>Create account</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <header className="relative z-[80] border-b border-[#172554] bg-[linear-gradient(180deg,#1E3A8A,#172554)] text-white shadow-[0_10px_28px_rgba(23,37,84,0.26)]">
      <div className="mx-auto hidden w-full max-w-6xl grid-cols-[minmax(18rem,24rem)_auto_minmax(14rem,18rem)_auto] items-center gap-4 px-4 py-3 md:grid">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center rounded-lg px-1 py-1 transition hover:opacity-95" aria-label="Bidra home">
            <Image
              src={LOGO_SRC}
              alt="Bidra"
              width={760}
              height={256}
              priority
              className="h-24 w-auto select-none lg:h-28"
            />
          </Link>
        </div>

        <nav className="flex items-center gap-2 self-center justify-self-start">
          <Link href="/listings" className={navButtonClass("/listings")}>Browse</Link>
          <Link href="/sell" className={navButtonClass("/sell")}>Sell</Link>
        </nav>

        <div className="min-w-0 justify-self-end">
          <SearchBar
            className="w-full max-w-[18rem] lg:max-w-[20rem]"
            inputClassName={searchInputClass}
            placeholder="Search listings"
          />
        </div>

        <div className="justify-self-end">
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
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className={navButtonClass("/auth/login")}>Sign in</Link>
              <Link href="/auth/register" className={navButtonClass("/auth/register")}>Create account</Link>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 md:hidden">
        <div className="shrink-0">
          <Link href="/" className="inline-flex items-center rounded-lg px-1 py-1 transition hover:opacity-95" aria-label="Bidra home">
            <Image
              src={LOGO_SRC}
              alt="Bidra"
              width={360}
              height={120}
              priority
              className="h-14 w-auto select-none"
            />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/sell" className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-white/95">
            Sell
          </Link>

          <div ref={mobileMenuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={accountButtonClass(mobileMenuOpen)}
              aria-haspopup="menu"
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              Menu
              {badge}
            </button>
            {mobileMenuOpen ? renderMobileMenu() : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 pb-2 md:hidden">
        <div className="mx-auto max-w-6xl pt-2">
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
