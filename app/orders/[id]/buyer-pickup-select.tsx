"use client";

import { useState } from "react";

export default function BuyerPickupSelect({ orderId, options }: { orderId: string; options: string[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(selectedAt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/pickup/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAt: selectedAt })
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
    <div className="mt-4 flex flex-col gap-2">
      {options.map(function (option) {
        const label = new Date(option).toLocaleString();
        return (
          <button
            key={option}
            type="button"
            className="bd-btn bd-btn-primary text-left"
            onClick={function () { choose(option); }}
            disabled={loading}
          >
            {loading ? "Saving..." : label}
          </button>
        );
      })}

      {error ? (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}
    </div>
  );
}
