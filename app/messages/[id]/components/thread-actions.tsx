"use client"

import { useState } from "react"

export default function ThreadActions({ threadId }: { threadId: string }) {
  const [busy, setBusy] = useState(false)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  async function doDelete() {
    setOkMsg(null)
    setErrMsg(null)

    const phrase = "DELETE"
    const input = window.prompt(
      "Delete this chat?\n\nThis removes the chat from your inbox.\nType DELETE to confirm:",
      ""
    )
    const ok = (input || "").trim().toUpperCase() === phrase
    if (!ok) return

    try {
      setBusy(true)
      const res = await fetch(`/api/messages/thread/${threadId}/delete`, { method: "POST" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrMsg(j?.error || "Delete failed")
        return
      }
      window.location.href = "/messages"
    } catch (e: any) {
      setErrMsg(e?.message || "Delete failed")
    } finally {
      setBusy(false)
    }
  }

  async function doReport() {
    setOkMsg(null)
    setErrMsg(null)

    const details = window.prompt("Report this chat. Briefly describe what happened:")
    if (!details) return

    try {
      setBusy(true)
      const res = await fetch(`/api/messages/thread/${threadId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrMsg(j?.error || "Report failed")
        return
      }
      setOkMsg("Report submitted. Thanks — we’ll review it.")
    } catch (e: any) {
      setErrMsg(e?.message || "Report failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={doReport}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10 disabled:opacity-50"
        >
          {busy ? "Working…" : "Report user"}
        </button>

        <button
          type="button"
          onClick={doDelete}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10 disabled:opacity-50"
        >
          Delete chat
        </button>
      </div>

      {okMsg ? (
        <div role="status" className="rounded-xl border border-black/10 bg-white/5 px-3 py-2 text-sm bd-ink">
          {okMsg}
        </div>
      ) : null}

      {errMsg ? (
        <div role="alert" className="rounded-xl border border-black/10 bg-white/5 px-3 py-2 text-sm bd-ink">
          {errMsg}
        </div>
      ) : null}
    </div>
  )
}
