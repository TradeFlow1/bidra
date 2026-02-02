"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import SafetyCallout from "../../../components/safety-callout"

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

      // Not logged in
      if (res.status === 401) {
        setBusy(false)
        router.push(`/auth/login?next=${encodeURIComponent(`/listings/${props.listingId}`)}`)
        return
      }

      const data = await res.json().catch(() => null)

      // Restricted / under-18 / gated
      if (res.status === 403) {
        setBusy(false)
        router.push("/account/restrictions")
        return
      }

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || "Could not start a message."
        const code = String(msg).toUpperCase()

        // If the API returns a restriction-style code, route to restrictions instead of showing raw codes
        if (
          code.includes("MISSING") ||
          code.includes("AGE") ||
          code.includes("VERIFY") ||
          code.includes("VERIF") ||
          code.includes("UNDER") ||
          code.includes("RESTRICT") ||
          code.includes("BLOCK") ||
          code.includes("STRIKE")
        ) {
          setBusy(false)
          router.push("/account/restrictions")
          return
        }

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
        className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-[15px] font-extrabold text-black shadow-sm hover:bg-black/5 disabled:opacity-60"
      >
        {busy ? "Opening chat…" : "Message seller"}
      </button>

      {err ? <div className="text-sm text-red-700">{err}</div> : null}

      <SafetyCallout title="Messaging safety">
        <ul className="list-disc pl-5">
          <li>Don’t share unnecessary personal info until you’re confident.</li>
          <li>Verify the item and seller details before paying.</li>
          <li>If something feels wrong, stop and report it.</li>
        </ul>
      </SafetyCallout>
    </div>
  )
}
