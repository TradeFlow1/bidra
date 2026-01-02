"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SearchBar from "./search-bar";

export default function SiteHeaderClient() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center gap-4">
      <SearchBar />

      <nav className="flex items-center gap-3 text-sm">
        <Link href="/listings">Browse</Link>
        <Link href="/sell">Sell</Link>

        {status === "authenticated" ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/api/auth/signout">Sign out</Link>
          </>
        ) : (
          <Link href="/auth/signin">Sign in</Link>
        )}
      </nav>
    </div>
  );
}
