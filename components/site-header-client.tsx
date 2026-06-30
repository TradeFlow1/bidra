"use client";

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
  { href: "/listings", label: "Browse" },
  { href: "/listings?type=OFFERABLE", label: "Auctions" },
  { href: "/listings?type=BUY_NOW", label: "Buy Now" },
  { href: "/wanted", label: "Wanted" },
  { href: "/sell/new", label: "Sell" },
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

function NotificationIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function WatchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

export default function SiteHeaderClient({ session, notificationCount = 0 }: { session?: SessionLike; notificationCount?: number }) {
  const [desktopAcctOpen, setDesktopAcctOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopAccountRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = !!session?.user?.id;
  const rawRole = String(session?.user?.role || "USER").toUpperCase();
  const accountRoleLabel = "Account";
  const accountRoleDescription = "Your buying, selling, orders, messages and watchlist.";

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

  const menuLinkClass = "block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-[#120724] transition hover:bg-[#F5F3FF] hover:text-[#6D28D9]";
  const searchInputClass = "h-12 w-full rounded-[16px] border border-white/16 bg-white/12 px-4 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition placeholder:text-white/60 focus:border-white/30 focus:ring-4 focus:ring-white/10";
  const badge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-extrabold text-[#6D28D9]">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  function renderAccountMenu(closeMenu: () => void) {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-72 overflow-hidden rounded-[24px] border border-[#DDD6FE] bg-white text-[#120724] shadow-[0_24px_70px_rgba(43,16,85,0.22)]" role="menu" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#F5F3FF] px-4 py-4">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#7C3AED]">Current account</div>
          <div className="mt-1 text-base font-extrabold text-[#120724]">My Bidra</div>
          <div className="mt-1 text-xs leading-5 text-[#62516F]">{accountRoleDescription}</div>
        </div>
        <div className="grid gap-1 p-2">
          {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={closeMenu}>Admin workspace</Link> : null}
          <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>Dashboard</Link>
          <Link href="/dashboard/listings" className={menuLinkClass} onClick={closeMenu}>My listings</Link>
          <Link href="/orders" className={menuLinkClass} onClick={closeMenu}>Orders</Link>
          <Link href="/messages" className={menuLinkClass} onClick={closeMenu}>Messages</Link>
          <Link href="/watchlist" className={menuLinkClass} onClick={closeMenu}>Watchlist</Link>
          <Link href="/notifications" className={menuLinkClass} onClick={closeMenu}>Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}</Link>
          <div className="mt-1 border-t border-[#EDE9FE] pt-1">
            <Link href="/logout" className={menuLinkClass} onClick={closeMenu}>Sign out</Link>
          </div>
        </div>
      </div>
    );
  }

  function renderMobileMenu() {
    return (
      <div className="absolute right-0 top-full z-[120] mt-3 w-[min(90vw,22rem)] overflow-hidden rounded-[24px] border border-[#DDD6FE] bg-white text-[#120724] shadow-[0_24px_70px_rgba(43,16,85,0.24)]" role="menu" onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-1 p-2">
          <Link href="/" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {DESKTOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
          ))}
          {isAuthed ? (
            <>
              <div className="my-1 border-t border-[#EDE9FE]" />
              {rawRole === "ADMIN" ? <Link href="/admin" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Admin workspace</Link> : null}
              <Link href="/dashboard" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>My Bidra</Link>
              <Link href="/messages" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link href="/notifications" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Notifications{badge}</Link>
              <Link href="/logout" className={menuLinkClass} onClick={() => setMobileMenuOpen(false)}>Sign out</Link>
            </>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#EDE9FE] pt-3">
              <Link href="/auth/login" className="bd-btn bd-btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="bd-btn bd-btn-primary !text-white" onClick={() => setMobileMenuOpen(false)}>Join Bidra</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-[100] bg-[linear-gradient(135deg,#10061F_0%,#150A28_56%,#21103C_100%)] text-white shadow-[0_18px_55px_rgba(18,7,36,0.28)]" data-site-header>
      <div className="mx-auto hidden h-[90px] w-full max-w-[1440px] items-center gap-5 px-6 lg:flex xl:px-8">
        <Link href="/" className="flex h-16 w-[220px] shrink-0 items-center" aria-label="Bidra home">
          <BrandLogo priority tone="light" />
        </Link>

        <nav className="flex shrink-0 items-center gap-1 xl:gap-2" aria-label="Primary navigation">
          {DESKTOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full px-3.5 py-2.5 text-[13px] font-black text-white/84 transition hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <SearchBar className="min-w-[16rem] max-w-[32rem] flex-1" inputClassName={searchInputClass} />

        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/watchlist" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-white"><WatchIcon /> Watchlist</Link>
          <Link href="/messages" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-white"><MessageIcon /> Messages</Link>
          {isAuthed ? (
            <div ref={desktopAccountRef} className="relative">
              <button type="button" onClick={(e) => { e.stopPropagation(); setDesktopAcctOpen(!desktopAcctOpen); }} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/12" aria-haspopup="menu" aria-expanded={desktopAcctOpen ? "true" : "false"}>
                {accountRoleLabel}{badge}
              </button>
              {desktopAcctOpen ? renderAccountMenu(() => setDesktopAcctOpen(false)) : null}
            </div>
          ) : (
            <Link href="/auth/login" className="inline-flex h-11 items-center rounded-full border border-white/18 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/12">Sign in</Link>
          )}
          <Link href="/sell/new" className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#7C3AED] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(124,58,237,0.30)] transition hover:bg-[#6D28D9]">Sell your item</Link>
          <Link href="/notifications" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-white/10 text-white transition hover:bg-white/12" aria-label="Notifications">
            <NotificationIcon />
            {notificationCount > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#A78BFA] ring-2 ring-[#120724]" aria-hidden="true" /> : null}
          </Link>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition active:scale-95" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }} aria-label="Open menu" aria-haspopup="menu" aria-expanded={mobileMenuOpen ? "true" : "false"}><MenuIcon /></button>
          <Link href="/" className="flex h-12 min-w-0 flex-1 items-center justify-center" aria-label="Bidra home">
            <BrandLogo priority tone="light" className="inline-flex items-center gap-2" />
          </Link>
          <div ref={mobileMenuRef} className="relative ml-auto">
            <button type="button" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }} className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition active:scale-95" aria-label="Account and notifications"><AccountIcon />{notificationCount > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#C4B5FD] ring-2 ring-[#120724]" aria-hidden="true" /> : null}</button>
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
