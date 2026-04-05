"use client";

import { useState } from "react";

export default function SellerPickupOptionsForm({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const raw = [
        String(fd.get("slot1") || "").trim(),
        String(fd.get("slot2") || "").trim(),
        String(fd.get("slot3") || "").trim()
      ];

      const options = raw
        .filter(Boolean)
        .map(function (v) { return new Date(v).toISOString(); });

      if (options.length !== 3) {
        throw new Error("Please provide all 3 pickup options.");
      }

      const uniqueOptions = Array.from(new Set(options));
      if (uniqueOptions.length !== 3) {
        throw new Error("Pickup options must be different.");
      }

      const times = uniqueOptions.map(function (v) { return new Date(v).getTime(); });
      const now = Date.now();

      if (times.some(function (t) { return !Number.isFinite(t) || t <= now; })) {
        throw new Error("Pickup options must be in the future.");
      }

      const sorted = times.slice().sort(function (a, b) { return a - b; });
      for (let j = 1; j < sorted.length; j += 1) {
        if ((sorted[j] - sorted[j - 1]) < (60 * 60 * 1000)) {
          throw new Error("Leave at least 1 hour between pickup options.");
        }
      }
      const res = await fetch(`/api/orders/${orderId}/pickup/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: options })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to save pickup options.");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Unable to save pickup options.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input name="slot1" type="datetime-local" required className="bd-input" />
        <input name="slot2" type="datetime-local" required className="bd-input" />
        <input name="slot3" type="datetime-local" required className="bd-input" />

        <button type="submit" className="bd-btn bd-btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add/replace pickup options"}
        </button>
      </form>

      {error ? (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}
    </div>
  );
}
