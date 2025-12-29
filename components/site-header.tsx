"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export default function SiteHeader() {
  const pathname = usePathname();
  const { data, status } = useSession();
  const isAuthed = status === "authenticated";
  const isAdmin = (data?.user as any)?.role === "ADMIN";

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const initials = useMemo(() => {
    const name =
      (data?.user as any)?.name ||
      (data?.user as any)?.username ||
      (data?.user as any)?.email ||
      "";
    const s = String(name).trim();
    if (!s) return "U";
    const parts = s.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "U";
    const b = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] || "");
    return (a + b).toUpperCase();
  }, [data]);

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  // ✅ Phase 4 VISUALS ONLY — Bidra brand header (ZIP tokens)
  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "var(--bidra-ink, #111827)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "saturate(180%) blur(10px)",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  };

  const brandStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 16,
    letterSpacing: 0.2,
  };

  const logoStyle: React.CSSProperties = {
    height: 22,
    width: "auto",
    display: "block",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
  };

  const linkStyle = (isOn: boolean): React.CSSProperties => ({
    color: isOn ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.78)",
    textDecoration: "none",
    fontWeight: 750,
    fontSize: 14,
    padding: "6px 8px",
    borderRadius: 10,
    background: isOn ? "rgba(255,255,255,0.08)" : "transparent",
    border: isOn ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
  });

  const profileBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: "7px 10px",
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    color: "rgba(255,255,255,0.92)",
  };

  const avatar: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: "rgba(255,255,255,0.10)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
  };

  const menuWrap: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  };

  const menu: React.CSSProperties = {
    position: "absolute",
    top: 44,
    right: 0,
    minWidth: 220,
    background: "rgba(17,24,39,0.98)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    padding: 8,
  };

  const menuItem: React.CSSProperties = {
    display: "block",
    padding: "10px 10px",
    borderRadius: 12,
    textDecoration: "none",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 750,
    fontSize: 14,
  };

  const menuItemSub: React.CSSProperties = {
    display: "block",
    padding: "2px 10px 10px 10px",
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
  };

  const dangerItem: React.CSSProperties = {
    ...menuItem,
    color: "rgba(255,255,255,0.92)",
    background: "rgba(59,130,246,0.18)",
    border: "1px solid rgba(59,130,246,0.22)",
  };

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={linkStyle(active("/"))}>Home</Link>

        <nav style={navStyle} aria-label="Primary">
          <Link href="/listings" style={linkStyle(active("/listings"))}>
            Browse
          </Link>
          <Link href="/sell" style={linkStyle(active("/sell"))}>
            Sell
          </Link>
          <Link href="/dashboard" style={linkStyle(active("/dashboard"))}>
            Dashboard
          </Link>
          {isAdmin ? (
            <Link href="/admin" style={linkStyle(active("/admin"))}>
              Admin
            </Link>
          ) : null}

          {!isAuthed ? (
            <>
              <Link href="/login" style={linkStyle(active("/login"))}>
                Sign in
              </Link>
              <Link
                href="/register"
                style={{
                  ...linkStyle(active("/register")),
                  color: "var(--bidra-blue, #3B82F6)",
                  border: "1px solid rgba(59,130,246,0.35)",
                  background: "rgba(59,130,246,0.12)",
                }}
              >
                Create account
              </Link>
            </>
          ) : (
            <div style={menuWrap} ref={menuRef}>
              <button
                type="button"
                style={profileBtn}
                onClick={() => setOpen(!open)}
                aria-haspopup="menu"
                aria-expanded={open ? "true" : "false"}
              >
                <span style={avatar}>{initials}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Account
                  <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 900 }}>
                    ▾
                  </span>
                </span>
              </button>

              {open ? (
                <div style={menu} role="menu">
                  <Link href="/account" style={menuItem} role="menuitem">
                    Account
                  </Link>
                  <span style={menuItemSub}>
                    {(data?.user as any)?.email || ""}
                  </span>

                  <Link href="/profile" style={menuItem} role="menuitem">
                    Edit profile
                  </Link>

                  <Link href="/orders" style={menuItem} role="menuitem">
                    Orders
                  </Link>

                  <Link href="/account/restrictions" style={menuItem} role="menuitem">
                    Restrictions
                  </Link>

                  <a href="/api/auth/signout" style={dangerItem} role="menuitem">
                    Sign out
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
