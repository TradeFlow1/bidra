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

  const pillBase = "inline-flex items-center rounded-md border px-3 py-2 text-sm transition";
  const pillIdle = pillBase + " border-black/10 bg-white font-semibold text-black hover:bg-black/5";
  const pillActive = pillBase + " border-black bg-black font-extrabold text-white";
  const ghostLink = "text-sm font-semibold text-neutral-700 hover:text-black";

  function navClass(href: string) {
    if (!pathname) { return pillIdle; }
    if (pathname === href || pathname.startsWith(href + "/")) {
      return pillActive;
    }
    return pillIdle;
  }

  function textNavClass(href: string) {
    if (!pathname) { return ghostLink; }
    if (pathname === href || pathname.startsWith(href + "/")) {
      return "text-sm font-bold text-black";
    }
    return ghostLink;
  }

  const badge = notificationCount > 0 ? (
    <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  return (
    <header className="border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-black">Bidra</span>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 md:flex md:justify-center">
          <SearchBar className="w-full max-w-md" placeholder="Search listings" />
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/listings" className={textNavClass("/listings")}>Browse</Link>
          <Link href="/sell" className={navClass("/sell")}>Sell</Link>

          {isAuthed ? (
            <>
              <Link href="/notifications" className="relative inline-flex items-center text-sm font-semibold text-neutral-700 hover:text-black">
                Notifications
                {badge}
              </Link>

              <Link href="/messages" className={textNavClass("/messages")}>Messages</Link>

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAcctOpen(!acctOpen)}
                  className={pillIdle}
                  aria-haspopup="menu"
                  aria-expanded={acctOpen ? "true" : "false"}
                >
                  Account
                </button>

                {acctOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5"
                      onClick={() => setAcctOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5"
                      onClick={() => setAcctOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5"
                      onClick={() => setAcctOpen(false)}
                    >
                      Notifications
                    </Link>
                    <form action="/api/auth/signout" method="post" className="border-t border-black/10">
                      <button
                        type="submit"
                        className="block w-full px-4 py-3 text-left text-sm font-semibold text-black hover:bg-black/5"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={textNavClass("/auth/login")}>Sign in</Link>
              <Link href="/auth/register" className={navClass("/auth/register")}>Create account</Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Link href="/listings" className={textNavClass("/listings")}>Browse</Link>
          <Link href="/sell" className={navClass("/sell")}>Sell</Link>
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
              </button>

              {acctOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
                  <Link href="/messages" className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5" onClick={() => setAcctOpen(false)}>
                    Messages
                  </Link>
                  <Link href="/dashboard" className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5" onClick={() => setAcctOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/orders" className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5" onClick={() => setAcctOpen(false)}>
                    Orders
                  </Link>
                  <Link href="/notifications" className="block px-4 py-3 text-sm font-semibold text-black hover:bg-black/5" onClick={() => setAcctOpen(false)}>
                    Notifications {notificationCount > 0 ? "(" + (notificationCount > 99 ? "99+" : String(notificationCount)) + ")" : ""}
                  </Link>
                  <form action="/api/auth/signout" method="post" className="border-t border-black/10">
                    <button type="submit" className="block w-full px-4 py-3 text-left text-sm font-semibold text-black hover:bg-black/5">
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/auth/login" className={pillIdle}>Sign in</Link>
          )}
        </div>
      </div>

      <div className="border-t border-black/5 px-4 pb-3 md:hidden">
        <div className="mx-auto max-w-6xl pt-3">
          <SearchBar className="w-full" placeholder="Search listings" />
        </div>
      </div>
    </header>
  );
}
