"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type SessionLike =
  | {
      user?: {
        id?: string;
        email?: string | null;
        username?: string | null;
        name?: string | null;
        role?: string | null;
      } | null;
    }
  | null
  | undefined;

export default function SiteHeaderClient({
  session,
  notificationCount = 0,
}: {
  session?: SessionLike;
  notificationCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") || "").toString();

  const isAuthed = !!session?.user?.id;
  const displayName = useMemo(() => {
    return session?.user?.username || session?.user?.name || session?.user?.email || "Account";
  }, [session]);

  // White pill (desktop + mobile)
  const pill =
    "inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bidra-link)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const linkPlain = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bidra-link)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  function closeAll() {
    setOpen(false);
    setAcctOpen(false);
  }

  // Close when navigating (route change)
  useEffect(() => {
    setOpen(false);
    setAcctOpen(false);
  }, [pathname]);


  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);
  // Close on click-outside + Esc
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const headerEl = headerRef.current;
      if (headerEl && headerEl.contains(target)) return; // click inside header => ignore

      setOpen(false);
      setAcctOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setAcctOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const badge =
    notificationCount && notificationCount > 0 ? (
      <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-black px-2 py-0.5 text-[11px] font-extrabold text-white">
        {notificationCount > 99 ? "99+" : notificationCount}
      </span>
    ) : null;

  return (
    <header ref={headerRef as any} className="bd-header border-b border-black/10">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Left: Home */}
        <div className="flex items-center gap-3">
          <Link href="/" className={pill} onClick={closeAll}>
            Home
          </Link>
        </div>

        {/* Center: Desktop search (locked) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <form action="/listings" method="get" className="w-full max-w-md" onSubmit={closeAll}>
            <input
              name="q"
               defaultValue={q}
              placeholder="Search listings"
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50 outline-none focus:border-black/20"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            />
          </form>
        </div>

        {/* Right: Desktop nav */}
        <nav className="relative hidden items-center gap-3 text-sm md:flex">
          <Link href="/listings" className={pill} onClick={closeAll}>
            Browse
          </Link>
          <Link href="/sell" className={pill} onClick={closeAll}>
            Sell
          </Link>

          {isAuthed ? (
            <>
              <Link href="/notifications" className={pill} onClick={closeAll}>
                Notifications{badge}
              </Link>

              <Link href="/messages" className={pill} onClick={closeAll}>
                Messages
              </Link>

              <button
                type="button"
                onClick={() => setAcctOpen((v) => !v)}
                className={pill}
                style={{ backgroundColor: "#ffffff", color: "#000000" }}
              >
                {displayName}
              </button>

              {acctOpen ? (
                <div
                  className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-black/10 bg-white text-black shadow-lg p-2"
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                >
                  <div className="flex flex-col text-sm">
                    <Link
                      href="/profile"
                      className={"rounded-md px-3 py-2 text-black hover:bg-black/5 " + linkPlain}
                      onClick={closeAll}
                    >
                      Account settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className={"rounded-md px-3 py-2 text-black hover:bg-black/5 " + linkPlain}
                      onClick={closeAll}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/orders"
                      className={"rounded-md px-3 py-2 text-black hover:bg-black/5 " + linkPlain}
                      onClick={closeAll}
                    >
                      Orders
                    </Link>

                    {(session?.user as any)?.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className={"rounded-md px-3 py-2 text-black hover:bg-black/5 " + linkPlain}
                        onClick={closeAll}
                      >
                        Admin
                      </Link>
                    ) : null}

                    <div className="my-2 border-t border-black/10" />

                    <Link
                      href="/logout"
                      className={"rounded-md px-3 py-2 text-black hover:bg-black/5 text-left " + linkPlain}
                      onClick={closeAll}
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/auth/login" className={pill} onClick={closeAll}>
                Sign in
              </Link>
              <Link href="/auth/register" className={pill} onClick={closeAll}>
                Create account
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              setAcctOpen(false);
            }}
            className={pill}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile search (locked) */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden">
        <form action="/listings" method="get" onSubmit={closeAll}>
          <input
            name="q"
               defaultValue={q}
            placeholder="Search listings"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50 outline-none focus:border-black/20"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
          />
        </form>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div id="mobile-nav" className="md:hidden border-t border-black/10 bd-header">
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/listings" onClick={closeAll} className={pill}>
                Browse
              </Link>
              <Link href="/sell" onClick={closeAll} className={pill}>
                Sell
              </Link>

              {isAuthed ? (
                <>
                  <Link href="/notifications" onClick={closeAll} className={pill}>
                    Notifications{badge}
                  </Link>
                  <Link href="/messages" onClick={closeAll} className={pill}>
                    Messages
                  </Link>
                  <Link href="/profile" onClick={closeAll} className={pill}>
                    Account settings
                  </Link>
                  <Link href="/dashboard" onClick={closeAll} className={pill}>
                    Dashboard
                  </Link>
                  <Link href="/orders" onClick={closeAll} className={pill}>
                    Orders
                  </Link>

                  {(session?.user as any)?.role === "ADMIN" ? (
                    <Link href="/admin" onClick={closeAll} className={pill}>
                      Admin
                    </Link>
                  ) : null}

                  <Link href="/logout" onClick={closeAll} className={pill}>
                    Sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={closeAll} className={pill}>
                    Sign in
                  </Link>
                  <Link href="/auth/register" onClick={closeAll} className={pill}>
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
