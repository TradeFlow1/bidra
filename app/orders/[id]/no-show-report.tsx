"use client";

import { useState } from "react";

export default function NoShowReport({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/no-show-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit no-show report.");
      }

      setOk(data.message || "No-show report submitted.");
      setReason("");
    } catch (e: any) {
      setError(e && e.message ? e.message : "Unable to submit no-show report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="text-sm font-semibold text-red-900">Need to report a no-show?</div>
      <div className="mt-1 text-xs text-red-900">
        Report a no-show here. This does not auto-resolve the order and will be recorded for review.
      </div>
      <textarea
        className="bd-input mt-3 min-h-[96px] w-full"
        value={reason}
        onChange={function (e) { setReason(e.target.value); }}
        placeholder="Briefly explain what happened at the scheduled pickup."
      />
      <button
        type="button"
        className="bd-btn bd-btn-primary mt-3"
        disabled={loading}
        onClick={submit}
      >
        {loading ? "Submitting..." : "Report no-show"}
      </button>
      {error ? <div className="mt-2 rounded-xl border border-red-300 bg-white p-3 text-sm text-red-800">{error}</div> : null}
      {ok ? <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{ok}</div> : null}
    </div>
  );
}
