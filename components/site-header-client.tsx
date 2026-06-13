"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./search-bar";
import BrandLogo from "./brand-logo";

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
  { href: "/categories", label: "Categories" },
];

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
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
  const accountRoleLabel = rawRole === "ADMIN" ? "Admin account" : rawRole === "SELLER" ? "Seller account" : "My Bidra";
  const accountRoleDescription = rawRole === "ADMIN"
    ? "Admin access visible for marketplace operations."
    : "Your buying, selling, orders, messages, and saved listings.";

  useEffect(function () {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (desktopAccountRef.current && target && !desktopAccountRef.current.contains(target)) setDesktopAcctOpen(false);
      if (mobileMenuRef.current && target && !mobileMenuRef.current.contains(target)) setMobileMenuOpen(false);
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

  const menuLinkClass = "block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-[#0F172A] transition hover:bg-[#EEF2FF]";
  const searchInputClass = "h-12 w-full rounded-2xl border border-[#D8E1F0] bg-white px-5 text-[15px] font-semibold text-[#0F172A] outline-none placeholder:text-[#64748B] shadow-sm focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]";
  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#4F46E5] px-1.5 py-0.5 text-[11px] font-extrabold text-white !text-white disabled:!text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-72 overflow-hidden rounded-[24px] border border-[#D7E2F1] bg-white text-[#4F46E5] shadow-[0_24px_70px_rgba(28,50,84,0.18)]" role="menu" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#F6F9FF] px-4 py-4">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#607089]">Current account</div>
          <div className="mt-1 text-base font-extrabold text-[#0F172A]">{accountRoleLabel}</div>
          <div className="mt-1 text-xs leading-5 text-[#607089]">{accountRoleDescription}</div>
        </div>
        <div className="grid gap-1 p-2">
          {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={closeMenu}>Admin workspace</Link> : null}
          <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>My Bidra dashboard</Link>
          <Link href="/dashboard/listings" className={menuLinkClass} onClick={closeMenu}>My listings</Link>
          <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>Orders</Link>
          <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>Messages</Link>
          <Link href="/watchlist" className={menuLinkClass} onClick={closeMenu}>Saved listings</Link>
          <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}</Link>
          <div className="mt-1 border-t border-[#E6EDF7] pt-1">
            <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>Sign out</Link>
          </div>
        </div>
      </div>
    );
  }

  function renderMobileMenu() {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-[min(90vw,22rem)] overflow-hidden rounded-[24px] border border-[#D7E2F1] bg-white text-[#4F46E5] shadow-[0_24px_70px_rgba(28,50,84,0.22)]" role="menu" onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-1 p-2">
          <Link href="/" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/categories" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Browse categories</Link>
          <Link href="/listings?type=BUY_NOW" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Buy now</Link>
          <Link href="/listings?type=OFFERABLE" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Make an offer</Link>
          <Link href="/sell/new" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Sell an item</Link>
          {isAuthed ? (
            <>
              <div className="my-1 border-t border-[#E6EDF7]" />
              {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Admin workspace</Link> : null}
              <Link href="/dashboard" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>{accountRoleLabel}</Link>
              <Link href="/messages" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link href="/notifications" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Notifications{badge}</Link>
              <Link href="/logout" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Sign out</Link>
            </>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#E6EDF7] pt-3">
              <Link href="/auth/login" className="bd-btn bd-btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="bd-btn bd-btn-primary" onClick={() => setMobileMenuOpen(false)}>Join</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-[#E2E8F0] bg-white/96 text-[#0F172A] backdrop-blur-xl">
      <div className="mx-auto hidden h-24 w-full max-w-[1320px] grid-cols-[220px_1fr_minmax(22rem,26rem)_auto] items-center gap-8 px-8 md:grid">
        <Link href="/" className="flex h-16 w-56 shrink-0 items-center" aria-label="Bidra home">
          <BrandLogo priority className="h-full w-auto max-w-full" />
        </Link>
        <nav className="flex min-w-0 items-center gap-8" aria-label="Primary navigation">
          {DESKTOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[15px] font-black text-[#0F172A] transition hover:text-[#4F46E5]">
              {link.label}
            </Link>
          ))}
        </nav>
        <SearchBar inputClassName={searchInputClass} />
        <div className="flex items-center gap-3 justify-self-end">
          
          {isAuthed ? (
            <div ref={desktopAccountRef} className="relative">
              <button type="button" onClick={(e) => { e.stopPropagation(); setDesktopAcctOpen(!desktopAcctOpen); }} className="bd-btn bd-btn-primary h-12 rounded-2xl px-6" aria-haspopup="menu" aria-expanded={desktopAcctOpen ? "true" : "false"}>
                {rawRole === "ADMIN" ? "Admin" : "Account"}{badge}
              </button>
              {desktopAcctOpen ? renderAccountMenu(() => setDesktopAcctOpen(false)) : null}
            </div>
          ) : (
            <Link href="/auth/login" className="bd-btn bd-btn-primary h-12 rounded-2xl px-6">Sign in</Link>
          )}
        </div>
      </div>

      <div className="md:hidden bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#D7E2F1] bg-white text-[#0F172A] shadow-sm transition active:scale-95" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }} aria-label="Open menu" aria-haspopup="menu" aria-expanded={mobileMenuOpen ? "true" : "false"}><MenuIcon /></button>
          <Link href="/" className="flex h-12 w-40 items-center" aria-label="Bidra home">
            <BrandLogo priority className="h-full w-auto max-w-full" />
          </Link>
          <div ref={mobileMenuRef} className="relative ml-auto">
            <button type="button" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }} className="relative grid h-11 w-11 place-items-center rounded-full border border-[#D7E2F1] bg-white text-[#0F172A] shadow-sm transition active:scale-95" aria-label="Account and notifications"><AccountIcon />{notificationCount > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#4F46E5] ring-2 ring-white" aria-hidden="true" /> : null}</button>
            {mobileMenuOpen ? renderMobileMenu() : null}
          </div>
        </div>
        <div className="px-4 pb-3">
          <SearchBar inputClassName={searchInputClass} />
        </div>
      </div>
    </header>
  );
}

