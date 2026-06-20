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
        <span className="text-sm font-black text-[#0F172A]">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          name="email"
          type="email"
          className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#07152E] placeholder:text-[#94A3B8] outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]"
          placeholder="you@example.com"
          required
        />
      </label>
      <button disabled={busy} type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white !text-white disabled:opacity-60 disabled:!text-white">
        {busy ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
