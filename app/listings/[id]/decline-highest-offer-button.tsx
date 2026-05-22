"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeclineHighestOfferButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onDecline() {
    if (loading) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/listings/${listingId}/decline-highest-offer`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(String((data as any)?.error || "Unable to decline the highest offer."));
        return;
      }
      setMsg("Highest offer declined. Buyers can continue placing offers while listing remains active.");
      router.refresh();
    } catch {
      setMsg("Unable to decline the highest offer right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={onDecline} disabled={loading} className="bd-btn bd-btn-ghost w-full">
        {loading ? "Declining..." : "Decline highest offer"}
      </button>
      {msg ? <div className="rounded-xl border border-[#D8E1F0] bg-white px-3 py-2 text-xs font-semibold text-[#475569]">{msg}</div> : null}
    </div>
  );
}
