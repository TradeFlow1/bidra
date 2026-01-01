"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  signedIn: boolean;
  isAdmin: boolean;
  displayName?: string | null;
};

const LOGO_ICON = "/icon.png"; // keep as-is

function initialsFromName(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const a = parts[0][0] ?? "U";
  const b = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (a + b).toUpperCase();
}

export default function SiteHeaderClient({ signedIn, isAdmin, displayName }: Props) {
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img src={LOGO_ICON} alt="Bidra" width={22} height={22} />
          <span className="text-sm font-semibold text-white">Bidra</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 sm:flex">
          <Link href="/listings" className="text-sm font-semibold text-white/80 hover:text-white">
            Browse
          </Link>
          <Link href="/sell/new" className="text-sm font-semibold text-white/80 hover:text-white">
            Sell
          </Link>

          {signedIn && (
            <Link href="/dashboard" className="text-sm font-semibold text-white/80 hover:text-white">
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin" className="text-sm font-semibold text-white/80 hover:text-white">
              Admin
            </Link>
          )}

          {/* Account dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              aria-expanded={open}
              aria-label="Account menu"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                {initials}
              </span>
              <span>Account</span>
              <span className="text-white/60">▾</span>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl"
                role="menu"
              >
                {!signedIn ? (
                  <div className="flex flex-col">
                    <Link className="px-4 py-2 text-sm text-white/85 hover:bg-white/5" href="/auth/login">
                      Sign in
                    </Link>
                    <Link className="px-4 py-2 text-sm text-white/85 hover:bg-white/5" href="/auth/register">
                      Create account
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link className="px-4 py-2 text-sm text-white/85 hover:bg-white/5" href="/account">
                      My account
                    </Link>
                    <Link className="px-4 py-2 text-sm text-white/85 hover:bg-white/5" href="/logout">
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="sm:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Open menu"
        >
          ☰ Menu
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10">
              <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/listings" onClick={() => setOpen(false)}>
                Browse listings
              </Link>
              <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/sell/new" onClick={() => setOpen(false)}>
                Sell an item
              </Link>

              {signedIn && (
                <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}

              <div className="h-px bg-white/10" />

              {!signedIn ? (
                <>
                  <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/auth/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/auth/register" onClick={() => setOpen(false)}>
                    Create account
                  </Link>
                </>
              ) : (
                <>
                  <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/account" onClick={() => setOpen(false)}>
                    My account
                  </Link>
                  <Link className="px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5" href="/logout" onClick={() => setOpen(false)}>
                    Sign out
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
