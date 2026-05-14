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

      setMsg("Sold item created. Opening order details so buyer and seller can confirm next steps.");
    } catch {
      setMsg("Buy Now could not be completed. Please try again.");
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
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#0B4DFF] px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(11,77,255,0.24)] transition hover:bg-[#0842D6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Securing item..." : "Buy now"}
      </button>

      {msg ? <div className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#475569]">{msg}</div> : null}
    </div>
  );
}
