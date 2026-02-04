"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SendBox({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [inFlight, setInFlight] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function send() {
    setErr(null)
    const text = body.trim()
    if (!text || busy || inFlight) return
    setBusy(true)
    setInFlight(true)
    try {
      const res = await fetch(`/api/messages/thread/${threadId}/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to send message")
      setBody("")
      router.refresh()
    } catch (e: any) {
      setErr(e?.message || "Failed to send message")
    } finally {
      setBusy(false)
      setInFlight(false)
    }
  }

  return (
    <div>
      <label className="bd-label">Message</label>

      <textarea
        className="bd-input mt-2 min-h-[96px]"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder="Write your message…"
        aria-label="Message text"
      />

      {err ? <div className="mt-2 text-sm text-red-600">{err}</div> : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--bidra-ink-2)]">
          Press <b>Enter</b> to send • <b>Shift+Enter</b> for a new line
        </div>

        <button
          type="button"
          disabled={busy || !body.trim()}
          onClick={send}
          className="bd-btn bd-btn-primary disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  )
}
