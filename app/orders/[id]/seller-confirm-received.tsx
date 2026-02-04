"use client";

import { useState } from "react";

export default function SellerConfirmReceived({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function confirmReceived() {
    setLoading(true);
    setErr(null);
    setOkMsg(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { method: "POST" });
      const data = await res.json().catch((): unknown => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Unable to confirm.");
      setOkMsg("Marked as completed.");
      window.location.href = `/orders/${orderId}?completed=1`;
    } catch (e: any) {
      setErr(e?.message || "Unable to confirm.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={confirmReceived}
        disabled={loading}
        className="bd-btn bd-btn-primary w-full text-center disabled:opacity-60"
      >
        {loading ? "Confirming..." : "Confirm handover & complete order"}
      </button>

      <div className="mt-2 text-xs bd-ink2">
        Only confirm once you have received payment and handed the item over. This marks the order as completed.
      </div>

      {err ? <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div> : null}
      {okMsg ? <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{okMsg}</div> : null}
    </div>
  );
}
