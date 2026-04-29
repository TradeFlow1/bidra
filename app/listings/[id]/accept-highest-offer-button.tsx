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
      const data = await res.json().catch((): unknown => ({}))
      if (!res.ok) {
        setErr(String(data?.error || "Unable to accept the highest offer right now."))
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
      setErr("We could not accept the highest offer. Please try again.")
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
        {loading ? "Creating order..." : "Accept highest offer and create order"}
      </button>

      <div className="text-xs text-neutral-600">
        This creates a pending order record and redirects to order details. Keep payment, pickup, postage, and handover arrangements in Bidra Messages.
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  )
}
