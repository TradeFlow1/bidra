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

      if (res.status === 401) {
        setBusy(false)
        router.push("/auth/login?next=" + encodeURIComponent("/listings/" + props.listingId))
        return
      }

      const data = await res.json().catch(() => null)

      if (res.status === 403) {
        setBusy(false)
        router.push("/account/restrictions")
        return
      }

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || "Could not open Messages for this listing."
        const code = String(msg).toUpperCase()

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
        setErr("Messages could not be opened for this listing. Please try again.")
        setBusy(false)
        return
      }

      router.push("/messages/" + threadId)
    } catch {
      setErr("Messages could not be opened. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Opening Messages..." : "Message seller"}
      </button>

      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</div> : null}
    </div>
  )
}
