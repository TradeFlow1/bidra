"use client";

import { useState } from "react";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export default function FtReportPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setBusy(true);
    try {
      await fetch("/api/ft/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          email: email || null,
          url: url || null,
          source: "FT-02",
        }),
      });
      setSent(true);
    } catch {
      alert("Failed to send report. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!FT_ENABLED) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Friend Test report</h1>
        <p className="mt-2 text-sm text-gray-600">
          This page is only available during the private Friend Test.
        </p>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Report received ✅</h1>
        <p className="mt-2 text-sm">Thanks — we’ll review it and fix what we can.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-bold">Report a bug (Friend Test)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Use this for broken behaviour during testing. (Not for listing/user safety reports.)
      </p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Short title</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Buy Now button does nothing on mobile"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">What happened?</label>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Steps to reproduce + what you expected vs what happened…"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Page URL (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.bidra.com.au/…"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="if you want follow-up"
          />
        </div>

        <button disabled={busy} className="bd-btn bd-btn-primary disabled:opacity-60">
          {busy ? "Sending…" : "Send report"}
        </button>
      </form>
    </main>
  );
}
