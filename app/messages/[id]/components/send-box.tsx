"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type SendState = "idle" | "sending" | "sent" | "failed"

const SEND_TIMEOUT_MS = 12000

function errorMessage(value: unknown) {
  if (value instanceof Error && value.name === "AbortError") {
    return "Message send timed out. Check your connection and try again."
  }

  if (value instanceof Error && value.message) {
    return value.message
  }

  return "Message failed to send. Try again."
}

export default function SendBox({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [lastDraft, setLastDraft] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [err, setErr] = useState<string | null>(null)

  const busy = sendState === "sending"

  async function send() {
    const text = body.trim()
    if (!text || busy) return

    const controller = new AbortController()
    const timeoutId = window.setTimeout(function () {
      controller.abort()
    }, SEND_TIMEOUT_MS)

    setErr(null)
    setLastDraft(text)
    setSendState("sending")

    try {
      const res = await fetch(`/api/messages/thread/${threadId}/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
        signal: controller.signal,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Message failed to send. Try again.")
      }

      setBody("")
      setSendState("sent")
      router.refresh()
    } catch (e: unknown) {
      setErr(errorMessage(e))
      setSendState("failed")
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  function retry() {
    if (busy) return
    if (!body.trim() && lastDraft) setBody(lastDraft)
    setErr(null)
    setSendState("idle")
  }

  return (
    <div>
      <label className="bd-label">Message</label>

      <textarea
        className="bd-input mt-2 min-h-[96px]"
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
          if (sendState !== "sending") {
            setSendState("idle")
            setErr(null)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder="Ask about the item, pickup, postage, payment expectations, or handover details…"
        aria-label="Message text"
        disabled={busy}
      />

      {sendState === "sent" ? (
        <div role="status" aria-live="polite" className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          Message sent.
        </div>
      ) : null}

      {sendState === "failed" && err ? (
        <div role="alert" className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <div>{err}</div>
          <button
            type="button"
            onClick={retry}
            className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-extrabold text-red-800 hover:bg-red-50"
          >
            Retry message
          </button>
        </div>
      ) : null}

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
          {busy ? "Sending..." : sendState === "failed" ? "Retry" : "Send"}
        </button>
      </div>
    </div>
  )
}
