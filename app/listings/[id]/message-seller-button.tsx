"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function MessageSellerButton(props: { listingId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onClick() {
    setErr(null)
    setBusy(true)

    try {
      const res = await fetch("/api/messages/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: props.listingId }),
      })

      // If not logged in, NextAuth often returns 401/403 depending on your handler
      if (res.status === 401) {
        setBusy(false)
        router.push(`/auth/login?next=${encodeURIComponent(`/listings/${props.listingId}`)}`)
        return
      }

            const data = await res.json().catch(() => null)

      // Under-18 / restricted users: route to restrictions page (server-side gate also exists)
      if (res.status === 403) {
        const code = String((data && (data.error || data.message)) || "").toUpperCase()
        if (code.includes("ADULT") || code.includes("RESTRICT") || code.includes("UNDER") || code.includes("18")) {
          setBusy(false)
          router.push("/account/restrictions")
          return
        }
      }

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || "Could not start a message."
        setErr(msg)
        setBusy(false)
        return
      }

      const threadId = data?.thread?.id
      if (!threadId) {
        setErr("Missing thread id from server.")
        setBusy(false)
        return
      }
      router.push(`/messages/${threadId}`)
    } catch {
      setErr("Something went wrong. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="w-full rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
      >
        {busy ? "Opening chat…" : "Message seller"}
      </button>

      {err ? (
        <div className="text-sm text-red-700">{err}</div>
      ) : null}

      <div className="text-xs text-neutral-600">
        Tip: keep personal info minimal until you&apos;re confident.
      </div>
    </div>
  )
}
