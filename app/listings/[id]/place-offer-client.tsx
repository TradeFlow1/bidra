"use client";

import { useState } from "react";

export default function PlaceOfferClient({
  listingId,
  minOfferCents,
}: {
  listingId: string;
  minOfferCents: number;
}) {
  const safeMinCents = Number.isFinite(Number(minOfferCents)) ? Number(minOfferCents) : 0;
  const minDollars = safeMinCents / 100;

  const [amount, setAmount] = useState<string>(minDollars ? minDollars.toFixed(2) : "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function submit() {
    setMsg("");

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg("Enter a valid amount.");
      return;
    }

    const cents = Math.round(value * 100);
    if (cents < safeMinCents) {
      setMsg(`Offer must be at least $${(safeMinCents / 100).toFixed(2)}.`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/offers/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: send dollars, server converts -> cents
        body: JSON.stringify({ listingId, amount: value }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Offer failed.");
        return;
      }

      const status = data?.status === "WINNING" ? "You have the top offer" : "You are no longer the top offer";
      const current = typeof data?.currentOfferCents === "number" ? (data.currentOfferCents / 100).toFixed(2) : null;

      setMsg(current ? `${status}. Current: $${current}` : `${status}.`);
      window.location.reload();
    } catch {
      setMsg("Offer failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-[var(--bidra-muted)]">
        Minimum offer:{" "}
        <span className="font-semibold text-[var(--bidra-fg)]">
          ${minDollars.toFixed(2)}
        </span>
      </div>

      <div className="text-xs text-[var(--bidra-muted)]">
        Enter the most you are willing to offer. We will keep you on top automatically up to that amount.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="e.g. 25.50"
          className="w-full rounded-xl border border-[var(--bidra-border)] bg-[var(--bidra-bg)] px-3 py-2 text-sm text-[var(--bidra-fg)] placeholder:text-[var(--bidra-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--bidra-link)]"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-[var(--bidra-link)] px-4 py-2 text-sm font-semibold text-[#0B0E11] transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Place offer"}
        </button>
      </div>

      {msg ? <div className="text-xs text-[var(--bidra-muted)]">{msg}</div> : null}
    </div>
  );
}
