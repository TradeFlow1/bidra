"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlaceOfferClient({
  listingId,
  minOfferCents,
  offerState = "NONE",
  disabled = false,
  disabledText = "Waiting for seller decision.",
}: {
  listingId: string;
  minOfferCents: number;
  offerState?: "NONE" | "TOP" | "OUTBID";
  disabled?: boolean;
  disabledText?: string;
}) {
  const safeMinCents = Number.isFinite(Number(minOfferCents)) ? Number(minOfferCents) : 0;
  const minDollars = safeMinCents / 100;

  const [amount, setAmount] = useState<string>(minDollars ? minDollars.toFixed(2) : "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [lastResult, setLastResult] = useState<null | {
    submittedCents: number;
    currentCents: number | null;
    isTop: boolean;
  }>(null);
  const router = useRouter();

  async function submit() {
    if (disabled) { setMsg(disabledText || "Waiting for seller decision."); return; }
    if (loading) { return; }
    setMsg("");
    setLastResult(null);

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
        setMsg(data?.error || data?.reason || "Offer failed.");
        return;
      }

      const isTop = data?.status === "TOP" || data?.status === "HIGHEST" || data?.status === "WINNING"; // backward compat
      const status = isTop ? "You are the highest offer" : "You have been out-offered";
      const current = typeof data?.currentOfferCents === "number" ? (data.currentOfferCents / 100).toFixed(2) : null;

      setLastResult({
        submittedCents: cents,
        currentCents: (typeof data?.currentOfferCents === "number") ? data.currentOfferCents : null,
        isTop,
      });
      setMsg("");
      router.refresh();
    } catch {
      setMsg("Offer failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
        <div className="space-y-3">
      {lastResult ? (
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
          <div className="text-sm font-extrabold text-neutral-900">
            Offer submitted ✅
          </div>
          <div className="mt-0.5 text-xs text-neutral-700">
            Max offer: <span className="font-semibold text-neutral-900">${(lastResult.submittedCents / 100).toFixed(2)}</span>
            {lastResult.currentCents !== null ? (
              <>
                {" "}• Current visible top offer:{" "}
                <span className="font-semibold text-neutral-900">${(lastResult.currentCents / 100).toFixed(2)}</span>
              </>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-neutral-700">
            {lastResult.isTop ? (
              <>You’re currently the highest offer. Waiting for seller decision at the end.</>
            ) : (
              <>You’ve been out-offered. Increase your max offer to try stay on top.</>
            )}
          </div>
        </div>
      ) : null}
      {offerState === "TOP" ? (
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-900">
          You are the highest offer.
        </div>
      ) : offerState === "OUTBID" ? (
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
          <div className="text-sm font-extrabold text-neutral-900">You have been out-offered.</div>
          <div className="mt-0.5 text-xs text-neutral-700">Increase your offer to stay on top.</div>
        </div>
      ) : null}
      <div className="text-xs text-[var(--bidra-muted)]">
        Minimum offer:{" "}
        <span className="font-semibold text-[var(--bidra-fg)]">
          ${minDollars.toFixed(2)}
        </span>
      </div>

      <div className="text-xs text-[var(--bidra-muted)]">
        Enter your MAX offer. We will automatically increase your visible offer (in $10 steps) to keep you on top, up to this limit.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          inputMode="decimal"
          placeholder="e.g. 25.50"
          disabled={disabled || loading}
          className="w-full h-11 rounded-xl border border-[var(--bidra-border)] bg-[var(--bidra-bg)] px-3 py-2 text-sm text-[var(--bidra-fg)] placeholder:text-[var(--bidra-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--bidra-link)] disabled:opacity-60"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading || disabled}
          className="w-full sm:w-auto rounded-xl bg-[var(--bidra-link)] px-4 py-2.5 text-sm font-semibold text-[#0B0E11] transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Place offer"}
        </button>
      </div>

      {(disabled && !msg) ? <div className="text-xs text-[var(--bidra-muted)]">{disabledText || "Waiting for seller decision."}</div> : null}
      {msg ? <div className="text-xs text-[var(--bidra-muted)]">{msg}</div> : null}
    </div>
  );
}
