"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function WatchButton({
  listingId,
  initialWatched,
  compact,
}: {
  listingId: string;
  initialWatched?: boolean;
  compact?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [watched, setWatched] = useState<boolean>(!!initialWatched);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If we got an initial value (server-side), don't fetch.
    if (typeof initialWatched === "boolean") return;

    // Logged out / loading: do not hit watchlist APIs.
    if (status !== "authenticated") {
      setWatched(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/watchlist/status?listingId=${encodeURIComponent(listingId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setWatched(!!j?.watched);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listingId, initialWatched, status]);

  const toggle = async () => {
    if (status !== "authenticated") {
      const qs = searchParams?.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      router.push(`/auth/login?next=${encodeURIComponent(nextUrl || "/listings")}`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      // If auth expired / gated, bounce to login.
      if (res.status === 401 || res.status === 403) {
        const qs = searchParams?.toString();
        const nextUrl = qs ? `${pathname}?${qs}` : pathname;
        router.push(`/auth/login?next=${encodeURIComponent(nextUrl || "/listings")}`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setWatched(!!data?.watched);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const base: React.CSSProperties = compact
    ? {
        borderRadius: 999,
        padding: "6px 12px",
        fontWeight: 900,
        fontSize: 12,
        whiteSpace: "nowrap",
      }
    : {
        borderRadius: 12,
        padding: "10px 12px",
        fontWeight: 900,
        fontSize: 14,
      };

  // Force readability even if parent styles do weird things
  const style: React.CSSProperties = {
    ...base,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    border: watched ? "1px solid #2563eb" : "1px solid rgba(0,0,0,0.18)",
    background: watched ? "rgba(37,99,235,0.14)" : "rgba(0,0,0,0.04)",

    color: "#111827",
    WebkitTextFillColor: "#111827",

    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.65 : 1,
    userSelect: "none",
  };

  return (
    <button type="button" onClick={toggle} disabled={busy} style={style} aria-label="Watch listing">
      {watched ? "Watching" : "Watch"}
    </button>
  );
}
