"use client";

import * as React from "react";
import Link from "next/link";

const KEY = {
  returnTo: "bidra_ret_return_to",
  returnToAt: "bidra_ret_return_to_at",
};

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function prettyPath(p: string) {
  if (!p) return "your last page";
  if (p.startsWith("/listings/")) return "the listing you viewed";
  if (p.startsWith("/seller/")) return "the seller you viewed";
  if (p === "/") return "home";
  return "your last page";
}

function isSafeInternalPath(p: string) {
  if (!p) return false;
  if (!p.startsWith("/")) return false;
  if (p.includes("..")) return false;
  if (p.startsWith("//")) return false;
  // Keep it internal only
  return true;
}

export default function ContinueWhereLeftOff() {
  const [href, setHref] = React.useState<string | null>(null);
  const [label, setLabel] = React.useState<string>("your last page");

  React.useEffect(() => {
    const rt = safeGet(KEY.returnTo) || "";
    const at = safeGet(KEY.returnToAt) || "";

    if (!rt || !isSafeInternalPath(rt)) {
      setHref(null);
      return;
    }

    // Optional: expire after 7 days
    const atNum = Number(at || "0");
    if (atNum && Date.now() - atNum > 7 * 24 * 60 * 60 * 1000) {
      safeRemove(KEY.returnTo);
      safeRemove(KEY.returnToAt);
      setHref(null);
      return;
    }

    setHref(rt);
    setLabel(prettyPath(rt));
  }, []);

  if (!href) return null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "white",
        borderRadius: 14,
        padding: 12,
        margin: "12px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontWeight: 900 }}>Continue where you left off</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Jump back to {label}.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link
          href={href}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Continue
        </Link>

        <button
          type="button"
          onClick={() => {
            safeRemove(KEY.returnTo);
            safeRemove(KEY.returnToAt);
            setHref(null);
          }}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid #d1d5db",
            background: "white",
            fontWeight: 800,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
