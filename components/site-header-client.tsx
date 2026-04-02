"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [acctOpen, setAcctOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = !!session?.user?.id;

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!accountRef.current) { return; }
      const target = e.target as Node | null;
      if (target && !accountRef.current.contains(target)) {
        setAcctOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAcctOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  function go(href: string) {
    setAcctOpen(false);
    router.push(href);
  }

  async function handleSignOut() {
    setAcctOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  const textIdle = "text-[13px] font-medium text-white/78 transition hover:text-white";
  const textActive = "text-[13px] font-semibold text-white";
  const pillIdle = "inline-flex items-center rounded-xl border border-white/14 bg-white/10 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-white/14";
  const pillActive = "inline-flex items-center rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-[0_4px_20px_rgba(0,0,0,0.35)]";
  const dropdownItem = "block w-full px-4 py-3 text-left text-[13px] font-medium text-[#0F172A] transition hover:bg-black/5";
  const searchInputClass = "w-full rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm text-black outline-none border border-black/10 placeholder:text-neutral-500 focus:border-black/25";

  function textNavClass(href: string) {
    if (!pathname) { return textIdle; }
    if (pathname === href || pathname.startsWith(href + "/")) {
      return textActive;
    }
    return textIdle;
  }

  function pillNavClass(href: string) {
    if (!pathname) { return pillIdle; }
    if (pathname === href || pathname.startsWith(href + "/")) {
      return pillActive;
    }
    return pillIdle;
  }

  const accountBadge = notificationCount > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[11px] font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  return (
    <header className="relative z-[80] overflow-visible border-b border-white/10 bg-[linear-gradient(180deg,#0B1220_0%,#18243D_100%)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3.5">
        <div className="min-w-0 shrink-0">
          <Link href="/" className="inline-flex items-center rounded-lg px-1 py-1 text-white transition hover:opacity-95">
            <span className="text-[20px] font-semibold tracking-tight">Bidra</span>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 md:flex md:justify-center">
          <SearchBar
            className="w-full max-w-md"
            inputClassName={searchInputClass}
            placeholder="Search listings"
          />
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/listings" className={textNavClass("/listings")}>Browse</Link>
          <Link href="/sell" className={pillNavClass("/sell")}>Sell</Link>

          {isAuthed ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAcctOpen(!acctOpen)}
                className={pillIdle}
                aria-haspopup="menu"
                aria-expanded={acctOpen ? "true" : "false"}
              >
                Account
                {accountBadge}
              </button>

              {acctOpen ? (
                <div className="absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                  <button type="button" className={dropdownItem} onClick={() => go("/dashboard")}>
                    Dashboard
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/orders")}>
                    Orders
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/messages")}>
                    Messages
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/notifications")}>
                    Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
                  </button>
                  <div className="border-t border-black/10">
                    <button type="button" className={dropdownItem} onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className={textNavClass("/auth/login")}>Sign in</Link>
              <Link href="/auth/register" className={pillNavClass("/auth/register")}>Create account</Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Link href="/listings" className={textNavClass("/listings")}>Browse</Link>
          <Link href="/sell" className={pillNavClass("/sell")}>Sell</Link>

          {isAuthed ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAcctOpen(!acctOpen)}
                className={pillIdle}
                aria-haspopup="menu"
                aria-expanded={acctOpen ? "true" : "false"}
              >
                Menu
                {accountBadge}
              </button>

              {acctOpen ? (
                <div className="absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0F172A] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                  <button type="button" className={dropdownItem} onClick={() => go("/dashboard")}>
                    Dashboard
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/orders")}>
                    Orders
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/messages")}>
                    Messages
                  </button>
                  <button type="button" className={dropdownItem} onClick={() => go("/notifications")}>
                    Notifications{notificationCount > 0 ? " (" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
                  </button>
                  <div className="border-t border-black/10">
                    <button type="button" className={dropdownItem} onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/auth/login" className={pillIdle}>Sign in</Link>
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



