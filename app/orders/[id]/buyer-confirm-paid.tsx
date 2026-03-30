"use client";

import { useState } from "react";

export default function BuyerConfirmPaymentSent({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirmPaymentSent() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/orders/${orderId}/pay/confirm`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Unable to confirm payment.");
      window.location.href = `/orders/${orderId}?payment_sent=1`;
    } catch (e: any) {
      setErr(e?.message || "Unable to confirm payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={confirmPaymentSent}
        disabled={loading}
        className="bd-btn bd-btn-primary w-full text-center disabled:opacity-60"
      >
        {loading ? "Confirming..." : "Confirm payment sent"}
      </button>
      <div className="text-xs bd-ink2">
        Only confirm once you have sent the payment via PayID/Osko.
      </div>
      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
