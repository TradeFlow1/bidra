"use client";

import { useMemo, useState } from "react";

function formatOptionParts(value: string) {
  const date = new Date(value);
  return {
    full: date.toLocaleString(),
    day: date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
    time: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  };
}

export default function BuyerPickupSelect({ orderId, options }: { orderId: string; options: string[] }) {
  const [selected, setSelected] = useState<string | null>(options && options.length ? String(options[0]) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedOptions = useMemo(function () {
    return (options || []).map(function (option) {
      return {
        value: option,
        parts: formatOptionParts(option)
      };
    });
  }, [options]);

  async function choose() {
    if (!selected) {
      setError("Choose a pickup time first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/pickup/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAt: selected })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to select pickup time.");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Unable to select pickup time.");
      setLoading(false);
    }
  }

  if (!options || !options.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="text-sm font-semibold bd-ink">Choose your pickup time</div>

      <div className="flex flex-col gap-3">
        {normalizedOptions.map(function (option) {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={
                "rounded-2xl border p-4 text-left transition " +
                (isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-950"
                  : "border-black/10 bg-white/5 bd-ink hover:border-black/20")
              }
              onClick={function () {
                setSelected(option.value);
                setError(null);
              }}
              disabled={loading}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{option.parts.day}</div>
                  <div className="mt-1 text-sm">{option.parts.time}</div>
                  <div className="mt-2 text-xs opacity-80">{option.parts.full}</div>
                </div>
                <div
                  className={
                    "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold " +
                    (isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-black/20 text-transparent")
                  }
                >
                  ✓
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/5 px-4 py-3 text-sm bd-ink2">
        Select one pickup time to confirm the updated schedule.
      </div>

      <button type="button" className="bd-btn bd-btn-primary" onClick={choose} disabled={loading || !selected}>
        {loading ? "Saving..." : "Confirm time"}
      </button>

      {error ? (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}
    </div>
  );
}