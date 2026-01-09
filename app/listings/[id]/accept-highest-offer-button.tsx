"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AcceptHighestOfferButton(props: { listingId: string }) {
  const { listingId } = props
  const r = useRouter()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onClick() {
    if (loading) return
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`/api/listings/${listingId}/accept-highest-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) {
        setErr(String(data?.error || "Unable to proceed with the highest offer."))
        setLoading(false)
        return
      }

      const orderId = data?.orderId
      if (orderId) {
        r.push(`/orders/${orderId}`)
        return
      }

      // Fallback: seller can view orders list
      r.push(`/orders`)
    } catch (e: any) {
      setErr("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bd-btn-primary w-full disabled:opacity-60"
      >
        {loading ? "Proceeding..." : "Proceed with highest offer"}
      </button>

      <div className="text-xs text-neutral-600">
        This does not auto-complete a sale. It creates an order so you and the buyer can arrange payment/pickup.
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  )
}
