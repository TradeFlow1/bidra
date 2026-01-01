"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SiteHeaderClient() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const isAuthed = !!session?.user;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";

  return (
    <header className="w-full border-b border-white/10 bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Brand/Home */}
        <Link href="/" className="text-sm font-semibold tracking-wide hover:opacity-90">Home</Link>

        {/* Right: Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="hover:opacity-90">Browse</Link>
          <Link href="/sell" className="hover:opacity-90">Sell</Link>

          {!loading && !isAuthed && (
            <>
              <Link href="/register" className="hover:opacity-90">Register</Link>
              <button
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/" })}
                className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10"
              >
                Sign in
              </button>
            </>
          )}

          {!loading && isAuthed && (
            <>
              <Link href="/dashboard" className="hover:opacity-90">Dashboard</Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10"
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
