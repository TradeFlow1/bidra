"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./search-bar";

type SessionLike = {
  user?: {
    id?: string;
    role?: string | null;
  } | null;
} | null | undefined;

const DESKTOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings?type=BUY_NOW", label: "Buy now" },
  { href: "/listings?type=OFFERABLE", label: "Make an offer" },
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
  const rawRole = String(session?.user?.role || "USER").toUpperCase();
  const accountRoleLabel = rawRole === "ADMIN" ? "Admin account" : "Buyer / seller account";
  const accountRoleDescription = rawRole === "ADMIN"
    ? "Admin access visible - trust operations and marketplace account tools"
    : "Buyer and seller tools visible - browse, buy, sell, orders, and messages";

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

  function utilityButtonClass(active: boolean) {
    return "inline-flex h-10 items-center justify-center rounded-full border px-4 text-[13px] font-semibold shadow-sm transition " +
      (active
        ? "border-white bg-white text-[#0F172A]"
        : "border-white/18 bg-white/10 text-white hover:bg-white/16");
  }

  const searchInputClass = "w-full rounded-full border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-neutral-500 shadow-sm focus:border-[#1D4ED8]";
  const menuLinkClass = "block w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#0F172A] transition hover:bg-black/5";

  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[11px] font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-64 overflow-hidden rounded-3xl border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(15,23,42,0.20)]" role="menu" onClick={function (e) { e.stopPropagation(); }}>
        <div className="border-b border-black/10 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current role</div>
          <div className="mt-1 text-sm font-extrabold text-[#0F172A]">{accountRoleLabel}</div>
          <div className="mt-1 text-xs leading-5 text-neutral-600">{accountRoleDescription}</div>
        </div>
        <div className="p-2">
          {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={closeMenu}>Admin workspace</Link> : null}
          <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>Account dashboard</Link>
          <Link href="/dashboard/listings" className={menuLinkClass} onClick={closeMenu}>Seller listings</Link>
          <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>Buyer orders</Link>
          <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>Buyer / seller messages</Link>
          <Link href="/watchlist" className={menuLinkClass} onClick={closeMenu}>Watchlist</Link>
          <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}</Link>
          <Link href="/account/restrictions" className={menuLinkClass} onClick={closeMenu}>Account status</Link>
          <div className="mt-2 border-t border-black/10 pt-2">
            <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>Sign out</Link>
          </div>
        </div>
      </div>
    );
  }

  function renderMobileMenu() {
    return (
      <div className="absolute right-0 top-full z-[120] mt-2.5 w-[min(88vw,20rem)] overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0F172A] shadow-[0_16px_36px_rgba(15,23,42,0.20)]" role="menu" onClick={function (e) { e.stopPropagation(); }}>
        <div className="p-2.5">
          <div className="grid grid-cols-1 gap-2">
            <Link href="/listings" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Browse</Link>
            <Link href="/listings?type=BUY_NOW" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Buy now</Link>
            <Link href="/listings?type=OFFERABLE" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Make an offer</Link>
            <Link href="/watchlist" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Watchlist</Link>
            <Link href="/sell" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Sell</Link>
          </div>

          {isAuthed ? (
            <div className="mt-2.5 border-t border-black/10 pt-2.5">
              <div className="mb-2 rounded-2xl border border-black/10 bg-neutral-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Current role</div>
                <div className="mt-1 text-sm font-extrabold text-[#0F172A]">{accountRoleLabel}</div>
                <div className="mt-1 text-xs leading-5 text-neutral-600">{accountRoleDescription}</div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Admin workspace</Link> : null}
                <Link href="/dashboard" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Account dashboard</Link>
                <Link href="/dashboard/listings" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Seller listings</Link>
                <Link href="/messages" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Buyer / seller messages</Link>
                <Link href="/orders" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Buyer orders</Link>
                <Link href="/watchlist" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Watchlist</Link>
                <Link href="/notifications" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}</Link>
                <Link href="/account/restrictions" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Account status</Link>
                <div className="mt-2 border-t border-black/10 pt-2">
                  <Link href="/logout" className={menuLinkClass} onClick={function () { setMobileMenuOpen(false); }}>Sign out</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 border-t border-black/10 pt-2.5">
              <div className="grid grid-cols-1 gap-2">
                <Link href="/auth/login" className="bd-btn bd-btn-ghost text-center" onClick={function () { setMobileMenuOpen(false); }}>Sign in</Link>
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
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_15rem_auto] items-center gap-4 px-4 py-2 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            {DESKTOP_LINKS.map(function (link) {
              return (
                <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-[13px] font-semibold text-white/92 transition hover:bg-white/12">
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="min-w-0">
            <SearchBar inputClassName={searchInputClass} />
          </div>

          <div className="flex shrink-0 items-center gap-3 justify-self-end">
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
                  {rawRole === "ADMIN" ? "Admin" : "Account"}
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
      </div>

      <div className="md:hidden">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full px-2 py-1 text-sm font-extrabold tracking-tight text-white">
              Bidra
            </Link>

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
        </div>
      </div>
    </header>
  );
}
