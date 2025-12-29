"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);

    if (!token) return setMsg("Missing token.");
    if (pw.length < 8) return setMsg("Password must be at least 8 characters.");
    if (pw !== pw2) return setMsg("Passwords do not match.");

    setBusy(true);
    try {
      const r = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) {
        setMsg(j?.error || "Reset failed.");
      } else {
        setMsg("Password updated. You can now log in.");
      }
    } catch {
      setMsg("Reset failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Reset password</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium">New password</label>
        <input
          type="password"
          className="w-full rounded-md border p-2"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          className="w-full rounded-md border p-2"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />
      </div>

      <button
        className="rounded-md border px-3 py-2 font-semibold"
        disabled={busy}
        onClick={submit}
      >
        {busy ? "Updating..." : "Update password"}
      </button>

      {msg ? <div className="text-sm">{msg}</div> : null}

      <div className="text-sm">
        <Link className="underline" href="/login">Back to login</Link>
      </div>
    </div>
  );
}
