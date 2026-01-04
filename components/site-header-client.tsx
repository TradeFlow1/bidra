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

  function closeAll() {
    setOpen(false);
    setAcctOpen(false);
  }

  return (
    <header className="border-b border-black/10 bd-header">
      {/* Top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Left: Home */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight" onClick={closeAll}>
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
        <nav className="relative hidden items-center gap-4 text-sm md:flex">
          <Link href="/listings" className="inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5" onClick={closeAll}>
            Browse
          </Link>
          <Link href="/sell" className="inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5" onClick={closeAll}>
            Sell
          </Link>

          {isAuthed ? (
            <>
              <Link href="/messages" className="inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5" onClick={closeAll}>
                Messages
              </Link>

              <button
                type="button"
                onClick={() => setAcctOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-md border border-black/10 px-3 py-2 hover:bg-black/5"
              >
                {displayName}
              </button>

              {acctOpen ? (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-md border border-black/10 bg-[#080E1A] shadow-lg">
                  <div className="flex flex-col p-2 text-sm">
                    <Link href="/profile" className="rounded px-3 py-2 hover:bg-black/5" onClick={closeAll}>
                      Account settings
                    </Link>
                    <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-black/5" onClick={closeAll}>
                      Dashboard
                    </Link>
                    <Link href="/orders" className="rounded px-3 py-2 hover:bg-black/5" onClick={closeAll}>
                      Orders
                    </Link>
                    <div className="my-1 border-t border-black/10" />
                    <Link href="/logout" className="rounded px-3 py-2 hover:bg-black/5 text-left" onClick={closeAll}>Sign out</Link>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5" onClick={closeAll}>
                Sign in
              </Link>
              <Link href="/auth/register" className="inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5" onClick={closeAll}>
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
            className="inline-flex items-center justify-center rounded-md border border-white/15 px-3 py-2 text-sm hover:bg-black/5"
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
              <Link href="/listings" onClick={closeAll}>Browse</Link>
              <Link href="/sell" onClick={closeAll}>Sell</Link>

              {isAuthed ? (
                <>
                  <Link href="/messages" onClick={closeAll}>Messages</Link>
                  <Link href="/profile" onClick={closeAll}>Account settings</Link>
                  <Link href="/dashboard" onClick={closeAll}>Dashboard</Link>
                  <Link href="/orders" onClick={closeAll}>Orders</Link>
                  <Link href="/logout" className="rounded px-3 py-2 hover:bg-black/5 text-left" onClick={closeAll}>Sign out</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={closeAll}>Sign in</Link>
                  <Link href="/auth/register" onClick={closeAll}>Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
