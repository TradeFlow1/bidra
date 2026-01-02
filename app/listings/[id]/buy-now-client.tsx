"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BuyNowClient({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onBuyNow() {
    setErr(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/buy-now`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
      const text = await res.text()
      let data: any = null
      try { data = JSON.parse(text) } catch { data = { error: text } }

      if (!res.ok) {
        setErr(data?.error || "Buy Now failed.")
        setBusy(false)
        return
      }

      if (data?.orderId) {
        router.push(`/orders/${data.orderId}`)
        return
      }

      router.refresh()
    } catch (e: any) {
      setErr(e?.message || "Buy Now failed.")
      setBusy(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
        onClick={onBuyNow}
      >
        {busy ? "Processing..." : "Buy now"}
      </button>

      {err ? <div className="mt-2 text-sm text-red-600">{err}</div> : null}
    </div>
  )
}
