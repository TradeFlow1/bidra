"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

export default function SiteHeaderClient({ session }: { session?: SessionLike }) {
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const isAuthed = !!session?.user?.id;
  const displayName = useMemo(() => {
    return (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email ||
      "My account"
    );
  }, [session]);

  const pill =
    "inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5";

  function closeAll() {
    setOpen(false);
    setAcctOpen(false);
  }

  return (
    <header className="bd-header border-b border-black/10" style={{ WebkitTapHighlightColor: "transparent" }}>
      {/* Top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Left: Home */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={pill}
            onClick={closeAll}
          >
            Home
          </Link>
        </div>

        {/* Center: Desktop search (locked) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <form action="/listings" method="get" className="w-full max-w-md">
            <input
              name="q"
              placeholder="Search listings"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/20"
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
              <Link href="/messages" className={pill} onClick={closeAll}>
                Messages
              </Link>

              <button
                type="button"
                onClick={() => setAcctOpen((v) => !v)}
                className={pill}
              >
                {displayName}
              </button>

              {acctOpen ? (
                <div className="absolute right-0 top-12 z-50 w-56 bd-card p-2">
                  <div className="flex flex-col text-sm">
                    <Link
                      href="/profile"
                      className="rounded-md px-3 py-2 bd-ink hover:bg-black/5"
                      onClick={closeAll}
                    >
                      Account settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="rounded-md px-3 py-2 bd-ink hover:bg-black/5"
                      onClick={closeAll}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/orders"
                      className="rounded-md px-3 py-2 bd-ink hover:bg-black/5"
                      onClick={closeAll}
                    >
                      Orders
                    </Link>

                    {(session?.user as any)?.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="rounded-md px-3 py-2 bd-ink hover:bg-black/5"
                        onClick={closeAll}
                      >
                        Admin
                      </Link>
                    ) : null}

                    <div className="my-2 border-t border-black/10" />

                    <Link
                      href="/logout"
                      className="rounded-md px-3 py-2 bd-ink hover:bg-black/5 text-left"
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
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile search (locked) */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <form action="/listings" method="get">
          <input
            name="q"
            placeholder="Search listings"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/20"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
          />
        </form>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="md:hidden border-t border-black/10 bd-header">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/listings" onClick={closeAll} className="bd-ink">
                Browse
              </Link>
              <Link href="/sell" onClick={closeAll} className="bd-ink">
                Sell
              </Link>

              {isAuthed ? (
                <>
                  <Link href="/messages" onClick={closeAll} className="bd-ink">
                    Messages
                  </Link>
                  <Link href="/profile" onClick={closeAll} className="bd-ink">
                    Account settings
                  </Link>
                  <Link href="/dashboard" onClick={closeAll} className="bd-ink">
                    Dashboard
                  </Link>
                  <Link href="/orders" onClick={closeAll} className="bd-ink">
                    Orders
                  </Link>

                  {(session?.user as any)?.role === "ADMIN" ? (
                    <Link href="/admin" onClick={closeAll} className="bd-ink">
                      Admin
                    </Link>
                  ) : null}

                  <Link
                    href="/logout"
                    className="bd-ink"
                    onClick={closeAll}
                  >
                    Sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={closeAll} className="bd-ink">
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeAll}
                    className="bd-ink"
                  >
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
