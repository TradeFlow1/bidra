"use client";
import { useState } from "react";
export default function BuyNowButton({ listingId }: {
    listingId: string;
}) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string>("");
    async function buyNow() {
        setMsg("");
        try {
            setLoading(true);
            const res = await fetch(`/api/listings/${listingId}/buy-now`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });
            const data = await res.json().catch(() => ({}));
            // Professional UX: if logged out, send user to sign-in with a return path.
            if (res.status === 401) {
                setMsg("Please sign in to Buy now.");
                const next = encodeURIComponent(`/listings/${listingId}`);
                window.location.href = `/auth/login?next=${next}`;
                return;
            }
            if (!res.ok) {
                setMsg(data?.error || "Buy now failed.");
                return;
            }
            const orderId = data?.orderId;
            if (orderId) {
                window.location.href = `/orders/${orderId}`;
                return;
            }
            setMsg("Sold item created. Opening order details so buyer and seller can confirm next steps.");
        }
        catch {
            setMsg("Buy now could not be completed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div>
      <button type="button" onClick={buyNow} disabled={loading}>
        {loading ? "Securing item..." : "Buy now"}
      </button>

      {msg ? <div>{msg}</div> : null}
    </div>);
}
