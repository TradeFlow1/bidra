"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./search-bar";

type SessionLike = {
  user?: {
    id?: string;
  } | null;
} | null | undefined;

const DESKTOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse" },
  { href: "/listings?type=BUY_NOW", label: "Buy Now" },
  { href: "/listings?type=OFFERABLE", label: "Offers" },
  { href: "/watchlist", label: "Watchlist" },
];

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse" },
  { href: "/listings?type=BUY_NOW", label: "Buy Now" },
  { href: "/listings?type=OFFERABLE", label: "Offers" },
];

export default function SiteHeaderClient({
  session,
  notificationCount = 0,
}: {
  session?: SessionLike;
  notificationCount?: number;
}) {
  const [desktopAcctOpen, setDesktopAcctOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopAccountRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = !!session?.user?.id;

  useEffect(function () {
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

    return function () {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  function utilityButtonClass(isOpen: boolean) {
    if (isOpen) {
      return "inline-flex h-10 items-center justify-center rounded-full border border-white/22 bg-[#0F172A] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#111827]";
    }
    return "inline-flex h-10 items-center justify-center rounded-full border border-white/16 bg-white/10 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-white/16";
  }

  function railLinkClass() {
    return "inline-flex h-10 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]";
  }

  const searchInputClass = "w-full rounded-full border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-neutral-500 shadow-sm focus:border-[#1D4ED8]";
  const menuLinkClass = "block w-full rounded-2xl px-4 py-3 text-left text-[13px] font-medium text-[#0F172A] transition hover:bg-black/5";

  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[11px] font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-60 overflow-hidden rounded-3xl border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(15,23,42,0.20)]" role="menu" onClick={function (e) { e.stopPropagation(); }}>
        <div className="p-2">
          <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>Dashboard</Link>
          <Link href="/profile" className={menuLinkClass} onClick={closeMenu}>Profile</Link>
          <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>Orders</Link>
          <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>Messages</Link>
          <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}</Link>
          <div className="mt-2 border-t border-black/10 pt-2">
            <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>Sign out</Link>
          </div>
        </div>
      </div>
    );
  }

  function renderMobileMenu() {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-[min(92vw,23rem)] overflow-hidden rounded-[28px] border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(15,23,42,0.20)]" role="menu" onClick={function (e) { e.stopPropagation(); }}>
        <div className="p-3">
          <div className="grid grid-cols-1 gap-2">
            <Link href="/" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Home</Link>
            <Link href="/listings" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Browse</Link>
            <Link href="/listings?type=BUY_NOW" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Buy Now</Link>
            <Link href="/listings?type=OFFERABLE" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Offers</Link>
            <Link href="/watchlist" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Watchlist</Link>
            <Link href="/sell" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Sell</Link>
          </div>

          {isAuthed ? (
            <div className="mt-3 border-t border-black/10 pt-3">
              <div className="grid grid-cols-1 gap-2">
                <Link href="/dashboard" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Dashboard</Link>
                <Link href="/messages" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Messages</Link>
                <Link href="/orders" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Orders</Link>
                <Link href="/profile" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Profile</Link>
                <div className="mt-2 border-t border-black/10 pt-2">
                  <Link href="/logout" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Sign out</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 border-t border-black/10 pt-3">
              <div className="grid grid-cols-1 gap-2">
                <Link href="/auth/login" className="bd-btn bd-btn-primary text-center" onClick={function () { setMobileMenuOpen(false); }}>Sign in</Link>
                <Link href="/auth/register" className="bd-btn bd-btn-ghost text-center" onClick={function () { setMobileMenuOpen(false); }}>Create account</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <header className="relative z-[80] border-b border-[#172554] bg-[linear-gradient(180deg,#17337A_0%,#152C6A_58%,#10214F_100%)] text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)]">
      <div className="hidden md:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-6 px-4 py-2 lg:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/sell" className="inline-flex h-10 items-center justify-center rounded-full border border-white/16 bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-white/95">
              Sell
            </Link>

            {isAuthed ? (
              <div ref={desktopAccountRef} className="relative">
                <button
                  type="button"
                  onClick={function (e) {
                    e.stopPropagation();
                    setDesktopAcctOpen(!desktopAcctOpen);
                  }}
                  className={utilityButtonClass(desktopAcctOpen)}
                  aria-haspopup="menu"
                  aria-expanded={desktopAcctOpen ? "true" : "false"}
                >
                  Account
                  {badge}
                </button>
                {desktopAcctOpen ? renderAccountMenu(function () { setDesktopAcctOpen(false); }) : null}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className={utilityButtonClass(false)}>Sign in</Link>
                <Link href="/auth/register" className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 bg-white/10 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-white/16">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-white/12 bg-[#132657]/95 backdrop-blur">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_15rem] items-center gap-4 px-4 py-1.5 lg:px-6">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
              {DESKTOP_LINKS.map(function (item) {
                return (
                  <Link key={item.href + ":" + item.label} href={item.href} className={railLinkClass()}>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="justify-self-end w-full max-w-[15rem]">
              <SearchBar className="w-full" inputClassName={searchInputClass} placeholder="Search Bidra" />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mx-auto px-4 pt-2 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-extrabold tracking-tight text-white">Bidra</div>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/sell" className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-white/95">
                Sell
              </Link>

              <div ref={mobileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={function (e) {
                    e.stopPropagation();
                    setMobileMenuOpen(!mobileMenuOpen);
                  }}
                  className={utilityButtonClass(mobileMenuOpen)}
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

          <div className="mt-2 grid grid-cols-4 gap-2">
            {MOBILE_LINKS.map(function (item) {
              return (
                <Link
                  key={item.href + ":" + item.label}
                  href={item.href}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-3 text-center text-[12px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/12 bg-[#132657]/95 px-4 py-1.5 backdrop-blur">
          <div className="mx-auto max-w-6xl">
            <SearchBar className="w-full" inputClassName={searchInputClass} placeholder="Search Bidra" />
          </div>
        </div>
      </div>
    </header>
  );
}