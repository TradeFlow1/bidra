"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg">
          Bidra
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:underline" href="/listings">
            Browse listings
          </Link>

          <Link className="hover:underline" href="/sell">
            Sell
          </Link>

          {status === "loading" ? null : session?.user ? (
            <>
              <Link className="hover:underline" href="/dashboard">
                Dashboard
              </Link>
              <button
                type="button"
                className="rounded-md border px-3 py-1 hover:bg-neutral-50"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="hover:underline" href="/auth/login">
                Log in
              </Link>
              <Link
                className="rounded-md bg-black text-white px-3 py-1 hover:opacity-90"
                href="/auth/register"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
