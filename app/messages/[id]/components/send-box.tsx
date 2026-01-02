"use client"

import { useState } from "react"

export default function SendBox({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function send() {
    setErr(null)
    const text = body.trim()
    if (!text) return
    setBusy(true)
    try {
      const res = await fetch(`/api/messages/thread/${threadId}/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to send message")
      setBody("")
      // simplest refresh: hard reload current route
      window.location.reload()
    } catch (e: any) {
      setErr(e?.message || "Failed to send message")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 rounded-lg border p-3">
      <label className="text-sm font-medium">Send a message</label>
      <textarea
        className="mt-2 w-full rounded-md border p-2 text-sm"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message…"
      />
      {err ? <div className="mt-2 text-sm text-red-600">{err}</div> : null}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={busy || !body.trim()}
          onClick={send}
          className="rounded-md border px-3 py-1 text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  )
}
