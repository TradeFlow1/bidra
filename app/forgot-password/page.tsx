"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);
    setDevLink(null);

    try {
      const r = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      setMsg("If an account exists for that email, a reset link will be sent.");
      if (j?.resetUrl) setDevLink(j.resetUrl);
    } catch {
      setMsg("If an account exists for that email, a reset link will be sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Forgot password</h1>

      <div className="text-sm text-neutral-600">
        Enter your email and we’ll send a reset link.
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          className="w-full rounded-md border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <button
        className="rounded-md border px-3 py-2 font-semibold"
        disabled={busy}
        onClick={submit}
      >
        {busy ? "Sending..." : "Send reset link"}
      </button>

      {msg ? <div className="text-sm">{msg}</div> : null}

      {devLink ? (
        <div className="text-sm">
          DEV reset link:{" "}
          <a className="underline" href={devLink}>
            {devLink}
          </a>
        </div>
      ) : null}

      <div className="text-sm">
        <Link className="underline" href="/login">Back to login</Link>
      </div>
      </div>
    </main>
  );
}

