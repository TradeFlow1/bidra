"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"

  const navLink = (href: string) => {
    const active =
      pathname === href ||
      (href === "/listings" && pathname?.startsWith("/listings"));
    return [
      "text-sm font-semibold transition",
      "text-[#0B0E11] hover:text-[#1DA1F2]",
      active ? "border-b-2 border-[#1DA1F2] pb-1" : "border-b-2 border-transparent pb-1",
    ].join(" ");
  };

  const isAuthed = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/svg/bidra_logo.svg"
            alt="Bidra"
            width={128}
            height={36}
            priority
          />
        </Link>

        <nav className="flex items-center gap-6">
          <Link className={navLink("/listings")} href="/listings">
            Browse
          </Link>

          <Link className={navLink("/sell")} href="/sell">
            Sell
          </Link>

          {isAuthed && (
            <Link className={navLink("/dashboard")} href="/dashboard">
              Dashboard
            </Link>
          )}

          {status === "loading" ? (
            <span className="text-sm opacity-70">…</span>
          ) : isAuthed ? (
            <Link
              href="/logout"
              className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-[#0B0E11] transition hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
            >
              Log out
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-black px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
