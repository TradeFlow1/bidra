"use client";

import { useState } from "react";

export default function RelistButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function relist() {
    setMsg("");
    try {
      setLoading(true);
      const res = await fetch("/api/listings/relist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Relist failed.");
        return;
      }

      window.location.reload();
    } catch {
      setMsg("Relist failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={relist}
        disabled={loading}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-50 disabled:opacity-60"
      >
        {loading ? "Relisting..." : "Relist"}
      </button>

      {msg ? <div className="text-xs text-neutral-600">{msg}</div> : null}
    </div>
  );
}
