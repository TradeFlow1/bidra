"use client"

export default function ThreadActions({ threadId }: { threadId: string }) {
  async function doDelete() {
    const phrase = "DELETE";
const input = window.prompt(
  "Delete this chat?\n\nThis removes the chat from your inbox.\nType DELETE to confirm:",
  ""
);
const ok = (input || "").trim().toUpperCase() === phrase;
    if (!ok) return
    const res = await fetch(`/api/messages/thread/${threadId}/delete`, { method: "POST" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || "Delete failed")
      return
    }
    window.location.href = "/messages"
  }

  async function doReport() {
    const details = window.prompt("Report this chat. Briefly describe what happened:")
    if (!details) return
    const res = await fetch(`/api/messages/thread/${threadId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(j?.error || "Report failed")
      return
    }
    alert("Report submitted. Thanks.")
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={doReport}
        className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10"
      >
        Report
      </button>
      <button
        type="button"
        onClick={doDelete}
        className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10"
      >
        Delete chat
      </button>
    </div>
  )
}
