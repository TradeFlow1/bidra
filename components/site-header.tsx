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

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#fff",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
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
    gap: 10,
    color: "#111",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
  };

  const logoDot: React.CSSProperties = {
    width: 14,
    height: 14,
    borderRadius: 5,
    background: "#1DA1F2",
    display: "inline-block",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
  };

  const linkStyle = (isOn: boolean): React.CSSProperties => ({
    color: "#1DA1F2",
    textDecoration: isOn ? "underline" : "none",
    fontWeight: 700,
    fontSize: 14,
  });

  const profileBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    borderRadius: 12,
    padding: "6px 10px",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
  };

  const avatar: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: "#f2f4f7",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    color: "#111",
    border: "1px solid rgba(0,0,0,0.10)",
  };

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: 220,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
    overflow: "hidden",
  };

  const menuItem: React.CSSProperties = {
    display: "flex",
    width: "100%",
    padding: "10px 12px",
    textDecoration: "none",
    color: "#111",
    fontSize: 14,
    fontWeight: 600,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  };

  const menuItemMuted: React.CSSProperties = {
    ...menuItem,
    color: "#555",
  };

  const divider: React.CSSProperties = {
    height: 1,
    background: "rgba(0,0,0,0.08)",
  };

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        {/* Brand / Home */}
        <Link href="/" style={brandStyle} aria-label="Home">
          <span aria-hidden="true" style={logoDot} />
          Bidra
        </Link>

        {/* Navigation */}
        <nav style={navStyle}>
          <Link href="/listings" style={linkStyle(active("/listings"))}>Browse</Link>
          <Link href="/sell" style={linkStyle(active("/sell"))}>Sell</Link>

          {isAuthed ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                style={profileBtn}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open ? "true" : "false"}
              >
                <span style={avatar} aria-hidden="true">{initials}</span>
                My account
              </button>

              {open ? (
                <div style={menuStyle} role="menu">
                  <Link href="/account" style={menuItem} onClick={() => setOpen(false)}>My account</Link>
                  <Link href="/" style={menuItem} onClick={() => setOpen(false)}>Home</Link>
                  <Link href="/orders" style={menuItem} onClick={() => setOpen(false)}>My purchases</Link>
                  <Link href="/watchlist" style={menuItem} onClick={() => setOpen(false)}>Watchlist</Link>

                  <div style={divider} />

                  <Link href="/dashboard/listings" style={menuItemMuted} onClick={() => setOpen(false)}>My listings</Link>

                  <div style={divider} />

                  {isAdmin ? (
                    <>
                      <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 900, color: "#666" }}>
                        Admin Console
                      </div>
                      <Link href="/admin/reports" style={menuItem} onClick={() => setOpen(false)}>Reports</Link>
                      <Link href="/admin/users" style={menuItem} onClick={() => setOpen(false)}>Users</Link>
                      <Link href="/admin/listings" style={menuItem} onClick={() => setOpen(false)}>Listings</Link>
                      <div style={divider} />
                    </>
                  ) : null}

                  {/* IMPORTANT: logout is ALWAYS via /logout (no NextAuth redirect logic) */}
                  <Link href="/logout" style={menuItem} onClick={() => setOpen(false)}>Log out</Link>
                </div>
              ) : null}
            </div>
          ) : status === "loading" ? (
            <span style={{ fontSize: 14, color: "#666" }}>Loading...</span>
          ) : (
            <>
              <Link href="/auth/login" style={linkStyle(active("/auth/login"))}>Log in</Link>
              <Link href="/auth/register" style={linkStyle(active("/auth/register"))}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
