"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SiteHeaderClient() {
  const { data: session, status } = useSession();

  const isAuthed = !!session?.user;
  const loading = status === "loading";

  return (
    <header className="w-full border-b border-white/10 bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: HOME */}
        <Link href="/" className="text-sm font-semibold tracking-wide hover:opacity-90">
          Home
        </Link>

        {/* Right: nav */}
        <nav className="flex items-center gap-3 text-sm">
          <Link className="rounded px-3 py-2 hover:bg-white/10" href="/listings">Browse</Link>
          <Link className="rounded px-3 py-2 hover:bg-white/10" href="/sell">Sell</Link>

          {loading ? (
            <span className="rounded px-3 py-2 text-white/60">…</span>
          ) : isAuthed ? (
            <>
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/dashboard">My account</Link>
              <button
                className="rounded bg-white/10 px-3 py-2 hover:bg-white/15"
                onClick={() => signOut({ callbackUrl: "/" })}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="rounded bg-white/10 px-3 py-2 hover:bg-white/15"
              onClick={() => signIn()}
              type="button"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
