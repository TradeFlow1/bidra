"use client";

import { useState } from "react";

export default function SellerConfirmReceived({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openMessages() {
    setLoading(true);
    setErr(null);
    try {
      window.location.href = `/orders/${orderId}/message`;
    } catch (e: any) {
      setErr(e?.message || "Unable to open messages.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={openMessages}
        disabled={loading}
        className="bd-btn bd-btn-primary w-full text-center disabled:opacity-60"
      >
        {loading ? "Opening..." : "Message about pickup or postage"}
      </button>

      <div className="mt-2 text-xs bd-ink2">
        This item is already sold. Use messages to arrange pickup or postage details.
      </div>

      {err ? <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div> : null}
    </div>
  );
}
