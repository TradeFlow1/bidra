"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  listingId: string;
  status: string;
};

export default function SellerListingReuseActions({ listingId, status }: Props) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"duplicate" | "relist" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canRelist = String(status || "").toUpperCase() === "ENDED";

  async function duplicateListing() {
    if (busyAction) return;
    setError(null);
    setBusyAction("duplicate");

    try {
      const res = await fetch(`/api/listings/${listingId}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.listingId) {
        setError(String(data?.error || `Duplicate listing failed (HTTP ${res.status})`));
        return;
      }

      router.push(`/sell/edit/${data.listingId}`);
      router.refresh();
    } catch (err: any) {
      setError(String(err?.message || err || "Duplicate listing failed."));
    } finally {
      setBusyAction(null);
    }
  }

  async function relistListing() {
    if (busyAction || !canRelist) return;
    setError(null);
    setBusyAction("relist");

    try {
      const res = await fetch("/api/listings/relist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data?.error || `Relist failed (HTTP ${res.status})`));
        return;
      }

      router.push(`/listings/${listingId}?relisted=1`);
      router.refresh();
    } catch (err: any) {
      setError(String(err?.message || err || "Relist failed."));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="bd-container pb-2">
      <div className="container max-w-3xl rounded-[24px] border border-[#D8E1F0] bg-[#F8FAFF] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Relist and duplicate</div>
            <h2 className="mt-1 text-lg font-black text-[#07152E]">Reuse this listing safely</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B]">
              Duplicate creates a draft copy you can review before publishing. Relist reactivates an ended listing when it has not been completed.
            </p>
          </div>
          <div className="grid gap-2 sm:min-w-[260px]">
            <button
              type="button"
              onClick={duplicateListing}
              disabled={!!busyAction}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#4F46E5] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === "duplicate" ? "Creating draft..." : "Duplicate as draft"}
            </button>
            {canRelist ? (
              <button
                type="button"
                onClick={relistListing}
                disabled={!!busyAction}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#4F46E5] px-4 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === "relist" ? "Relisting..." : "Relist ended listing"}
              </button>
            ) : null}
          </div>
        </div>
        {error ? <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</div> : null}
      </div>
    </section>
  );
}
