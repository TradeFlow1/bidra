"use client";

import { useState } from "react";

export default function BuyNowButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function buyNow() {
    setMsg("");
    try {
      setLoading(true);
      const res = await fetch(`/api/listings/${listingId}/buy-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json().catch(() => ({}));

      // Professional UX: if logged out, send user to sign-in with a return path.
      if (res.status === 401) {
        setMsg("Please sign in to Buy Now.");
        const next = encodeURIComponent(`/listings/${listingId}`);
        window.location.href = `/auth/login?next=${next}`;
        return;
      }

      if (!res.ok) {
        setMsg(data?.error || "Buy Now failed.");
        return;
      }

      const orderId = data?.orderId;
      if (orderId) {
        window.location.href = `/orders/${orderId}`;
        return;
      }

      setMsg("Order created. Open Orders to continue in Bidra Messages.");
    } catch {
      setMsg("Buy Now failed.");
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
        className="w-full rounded-xl bg-[#1DA1F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90 disabled:opacity-60"
      >
        {loading ? "Processing..." : "Buy Now"}
      </button>

      {msg ? <div className="text-xs text-neutral-600">{msg}</div> : null}
    </div>
  );
}
