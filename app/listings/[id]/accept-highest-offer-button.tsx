"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AcceptHighestOfferButton(props: {
    listingId: string;
}) {
    const { listingId } = props;
    const r = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    async function onClick() {
        if (loading)
            return;
        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(`/api/listings/${listingId}/accept-highest-offer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch((): unknown => ({}));
            if (!res.ok) {
                setErr(String(data?.error || "Unable to accept the highest offer right now."));
                setLoading(false);
                return;
            }
            const orderId = data?.orderId;
            if (orderId) {
                r.push(`/orders/${orderId}`);
                return;
            }
            // Fallback: seller can view orders list
            r.push(`/orders`);
        }
        catch (e: any) {
            setErr("We could not accept the highest offer. Please try again.");
            setLoading(false);
        }
    }
    return (<div>
      <button type="button" onClick={onClick} disabled={loading}>
        {loading ? "Creating sold item..." : "Accept highest offer"}
      </button>

      <div>
        This marks the listing as sold and opens order details. Use the order page to continue the sale.
      </div>

      {err ? <div>{err}</div> : null}
    </div>);
}
