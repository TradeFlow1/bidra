"use client";

import { useState } from "react";

export default function BuyNowButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function buyNow() {
    setMsg("");
    try {
      setLoading(true);
      const res = await fetch("/api/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Buy now failed.");
        return;
      }

      const orderId = data?.orderId;
      if (orderId) {
        window.location.href = `/orders/${orderId}`;
        return;
      }

      window.location.reload();
    } catch {
      setMsg("Buy now failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={buyNow}
        disabled={loading}
        className="w-full rounded-xl border border-black/10 bg-bidra-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-bidra-blue/90 focus:outline-none focus:ring-2 focus:ring-bidra-blue/40 disabled:opacity-60"
      >
        {loading ? "Processing..." : "Buy now"}
      </button>

      {msg ? <div className="text-xs text-neutral-600">{msg}</div> : null}
    </div>
  );
}
