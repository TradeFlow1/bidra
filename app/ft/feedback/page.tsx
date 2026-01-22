"use client";

import { useState } from "react";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export default function FtFeedbackPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setBusy(true);
    try {
      await fetch("/api/ft/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email: email || null,
          source: "FT-P1",
        }),
      });
      setSent(true);
    } catch {
      alert("Failed to send feedback. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!FT_ENABLED) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Feedback (Friend Test only)</h1>
        <p className="mt-2 text-sm text-gray-600">
          This page is only available during the private Friend Test.
        </p>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Thanks 🙏</h1>
        <p className="mt-2 text-sm">Your feedback helps us find issues before launch.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-bold">Help us improve Bidra</h1>
      <p className="mt-2 text-sm text-gray-600">
        Found something confusing or broken? Tell us here.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">What happened?</label>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Email (optional, if you want follow-up)
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        <button disabled={busy} className="bd-btn bd-btn-primary disabled:opacity-60">
          {busy ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </main>
  );
}
