"use client";

import { useState } from "react";

export default function PayConfirmClient({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirmPaid() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay/confirm`, { method: "POST" });
      const data = await res.json().catch((): unknown => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Unable to confirm payment.");
      window.location.href = `/orders/${orderId}?paid=1`;
    } catch (e: any) {
      setErr(String(e?.message || e));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="bd-btn bd-btn-primary w-full sm:w-auto text-center py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
        onClick={confirmPaid}
        disabled={loading}
      >
        {loading ? "Confirming..." : "I’ve paid"}
      </button>

      {err ? <div className="text-sm" style={{ color: "var(--bidra-danger)" }}>{err}</div> : null}
      <div className="text-xs bd-ink2">
        Only confirm once you have sent the payment via PayID/Osko.
      </div>
    </div>
  );
}
