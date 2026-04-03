"use client";

import { useState } from "react";

export default function BuyerConfirmReadyForPickup({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirmReadyForPickup() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/orders/${orderId}/pay/confirm`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Unable to confirm this step.");
      window.location.href = `/orders/${orderId}?pickup_ready=1`;
    } catch (e: any) {
      setErr(e?.message || "Unable to confirm this step.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={confirmReadyForPickup}
        disabled={loading}
        className="bd-btn bd-btn-primary w-full text-center disabled:opacity-60"
      >
        {loading ? "Confirming..." : "Confirm ready for pickup"}
      </button>
      <div className="text-xs bd-ink2">
        Only confirm once the scheduled pickup is still proceeding as planned.
      </div>
      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
