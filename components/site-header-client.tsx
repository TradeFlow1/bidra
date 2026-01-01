"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

export default function SiteHeaderClient() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const isAuthed = !!session?.user
  const role = (session?.user as any)?.role
  const isAdmin = role === "ADMIN"

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  return (
    <header className="w-full border-b border-white/10 bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Home */}
        <Link href="/" className="text-sm font-semibold tracking-wide hover:opacity-90">
          Home
        </Link>

        {/* Right: Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="hover:opacity-90">Browse</Link>
          <Link href="/sell" className="hover:opacity-90">Sell</Link>

          {!loading && !isAuthed && (
            <>
              <Link href="/register" className="hover:opacity-90">Register</Link>
              <button
                type="button"
                className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10"
                onClick={() => signIn(undefined, { callbackUrl: "/" })}
              >
                Sign in
              </button>
            </>
          )}

          {!loading && isAuthed && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10"
                onClick={() => setOpen(!open)}
              >
                My account <span aria-hidden="true">▾</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] shadow-lg">
                  <div className="px-3 py-2 text-xs text-white/70">
                    Signed in as <span className="text-white">{(session?.user as any)?.email || "Account"}</span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <Link className="block px-3 py-2 hover:bg-white/10" href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-white/10" href="/watchlist" onClick={() => setOpen(false)}>
                    Watchlist
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-white/10" href="/orders" onClick={() => setOpen(false)}>
                    Orders
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-white/10" href="/account" onClick={() => setOpen(false)}>
                    Account settings
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="h-px bg-white/10" />
                      <Link className="block px-3 py-2 hover:bg-white/10" href="/admin" onClick={() => setOpen(false)}>
                        Admin tools
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-white/10" />

                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left hover:bg-white/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
