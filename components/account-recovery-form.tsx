"use client";

import { useState } from "react";

export default function AccountRecoveryForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-sm font-bold leading-6 text-emerald-950">
        If this email belongs to a Bidra account, reset instructions have been sent.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-black text-[#120724]">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          name="email"
          type="email"
          className="bd-input mt-2 h-12 w-full rounded-2xl px-4 text-sm font-semibold"
          placeholder="you@example.com"
          required
        />
      </label>
      <button disabled={busy} type="submit" className="bd-btn bd-btn-primary h-12 w-full rounded-2xl text-sm font-black !text-white disabled:opacity-60">
        {busy ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
