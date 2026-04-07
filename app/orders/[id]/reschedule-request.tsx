"use client";

import { useMemo, useState } from "react";

const REASONS = [
  { value: "RUNNING_LATE", label: "Running late" },
  { value: "CANNOT_MAKE_TIME", label: "Cannot make this time" },
  { value: "NEED_ANOTHER_DAY", label: "Need another day" },
  { value: "AVAILABILITY_CHANGED", label: "Availability changed" },
  { value: "OTHER", label: "Other" }
];

export default function RescheduleRequest({ orderId }: { orderId: string }) {
  const [reasonCode, setReasonCode] = useState<string>(REASONS[0].value);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const selectedLabel = useMemo(function () {
    const match = REASONS.find(function (item) { return item.value === reasonCode; });
    return match ? match.label : "Other";
  }, [reasonCode]);

  async function submit() {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/reschedule-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: reasonCode,
          note: note
        })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to update pickup timing.");
      }

      setOk(data.message || "Pickup timing updated.");
      setNote("");
    } catch (e: any) {
      setError(e && e.message ? e.message : "Unable to update pickup timing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="text-sm font-semibold text-amber-900">Need to change the pickup time?</div>
      <div className="mt-1 text-xs text-amber-900">
        Start the in-order change here. The current pickup time still applies until a new time is chosen in the order.
      </div>

      <div className="mt-3 grid gap-2">
        {REASONS.map(function (item) {
          const active = item.value === reasonCode;
          return (
            <button
              key={item.value}
              type="button"
              className={
                "rounded-xl border px-4 py-3 text-left text-sm transition " +
                (active
                  ? "border-amber-500 bg-white text-amber-950"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300")
              }
              onClick={function () { setReasonCode(item.value); }}
              disabled={loading}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <textarea
        className="bd-input mt-3 min-h-[96px] w-full"
        value={note}
        onChange={function (e) { setNote(e.target.value); }}
        placeholder={"Optional note about the change: " + selectedLabel}
      />

      <button
        type="button"
        className="bd-btn bd-btn-primary mt-3"
        disabled={loading}
        onClick={submit}
      >
        {loading ? "Updating..." : "Change pickup time"}
      </button>

      {error ? <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
      {ok ? <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{ok}</div> : null}
    </div>
  );
}