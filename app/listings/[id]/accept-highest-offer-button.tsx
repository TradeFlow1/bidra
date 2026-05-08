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
        className="bd-btn bd-btn-primary w-full"
      >
        {loading ? "Creating sold item..." : "Accept highest offer"}
      </button>

      <div className="text-xs text-neutral-600">
        This marks the listing as sold and opens order details. Keep payment, pickup, postage, and handover arrangements in Bidra Messages.
      </div>

      {err ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{err}</div> : null}
    </div>
  )
}
