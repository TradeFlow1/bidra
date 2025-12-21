"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function SiteHeader() {
  const { data } = useSession();
  const user = data?.user as any;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">Bidra</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/listings" className="hover:underline">Browse</Link>
            <Link href="/sell" className="hover:underline">Sell</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/legal/safety" className="hover:underline">Safety</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
              <Link href="/orders" className="hover:underline">Orders</Link>
              <Link href="/watchlist" className="hover:underline">Watchlist</Link>
              {user.role === "ADMIN" ? <Link href="/admin" className="hover:underline">Admin</Link> : null}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border px-3 py-1 hover:bg-neutral-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-md border px-3 py-1 hover:bg-neutral-50">Log in</Link>
              <Link href="/auth/register" className="rounded-md bg-black text-white px-3 py-1 hover:opacity-90">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
