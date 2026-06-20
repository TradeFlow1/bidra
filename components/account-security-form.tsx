"use client";

import { useState } from "react";

function messageFor(code: string | null) {
  if (code === "changed") return "Your sign-in secret was updated.";
  if (code === "missing") return "Complete all three fields.";
  if (code === "short") return "Use at least 8 characters.";
  if (code === "mismatch") return "The new entries do not match.";
  if (code === "same") return "Choose something different from your current entry.";
  if (code === "current") return "The current entry was not accepted.";
  if (code === "unavailable") return "This account cannot be updated here.";
  return null;
}

export default function AccountSecurityForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const message = messageFor(status);
  const good = status === "changed";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setStatus(null);

    try {
      const res = await fetch("/api/account/credentials", {
        method: "POST",
        body: data,
      });
      const payload = await res.json().catch(() => ({}));
      setStatus(String(payload?.code || (res.ok ? "changed" : "error")));
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-black">Current password</span>
          <input name="current" type="password" autoComplete="current-password" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" required />
        </label>
        <label className="block">
          <span className="text-sm font-black">New password</span>
          <input name="next" type="password" autoComplete="new-password" minLength={8} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" required />
        </label>
        <label className="block">
          <span className="text-sm font-black">Confirm new password</span>
          <input name="confirm" type="password" autoComplete="new-password" minLength={8} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" required />
        </label>
      </div>

      {message ? (
        <p className={good ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-900" : "rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900"}>
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold text-[#64748B]">Use this only from your own device. You stay signed in after the update.</p>
        <button disabled={busy} type="submit" className="h-12 rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white disabled:opacity-60">
          {busy ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
