"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SearchBar from "./search-bar";

type SessionLike = {
  user?: {
    id?: string;
  } | null;
} | null | undefined;

export default function SiteHeaderClient({ session, notificationCount = 0 }: { session?: SessionLike; notificationCount?: number }) {
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const headerRef = useRef(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") || "").toString();

  const isAuthed = !!session?.user?.id;

  const pill = "inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5";
  const pillActive = "inline-flex items-center rounded-md border border-black bg-black px-3 py-2 text-sm font-extrabold text-white";

  function navPill(href: string) {
    if (!pathname) return pill;
    if (pathname === href || pathname.startsWith(href + "/")) return pillActive;
    return pill;
  }

  const badge = notificationCount > 0 ? (
    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {notificationCount > 99 ? "99+" : notificationCount}
    </span>
  ) : null;

  return (
    <header ref={headerRef} className="bd-header border-b border-black/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">

        <Link href="/" className={navPill("/")}>Home</Link>

        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar className="w-full max-w-md" placeholder="Search listings" />
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <Link href="/listings" className={navPill("/listings")}>Browse</Link>
          <Link href="/sell" className={navPill("/sell")}>Sell</Link>

          {isAuthed && (
            <>
              <Link href="/notifications" className={navPill("/notifications")} style={{ position: "relative" }}>
                Notifications
                {badge}
              </Link>

              <Link href="/messages" className={navPill("/messages")}>Messages</Link>
              <Link href="/dashboard" className={navPill("/dashboard")}>Dashboard</Link>
              <Link href="/orders" className={navPill("/orders")}>Orders</Link>
            </>
          )}

          {!isAuthed && (
            <>
              <Link href="/auth/login" className={pill}>Sign in</Link>
              <Link href="/auth/register" className={pill}>Create account</Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
