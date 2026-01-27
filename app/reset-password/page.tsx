"use client";

import { useMemo, useState } from "react";



function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = String(searchParams?.token ?? "").trim();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwTooShort = useMemo(() => pw.length > 0 && pw.length < 8, [pw]);
  const pwMismatch = useMemo(() => pw2.length > 0 && pw !== pw2, [pw, pw2]);

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (loading) return false;
    if (pw.length < 8) return false;
    if (pw2.length < 8) return false;
    if (pw !== pw2) return false;
    return true;
  }, [token, loading, pw, pw2]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }
    if (pwTooShort) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pwMismatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!canSubmit) {
      setError("Please complete the form.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw }),
      });

      const data = await res.json().catch((): unknown => ({}));
      if (!res.ok || !data?.ok) {
        setError(String(data?.error || "Unable to reset password. Please request a new link."));
        return;
      }

      setOk(true);
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="bd-card p-5 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Reset password</h1>
          <p className="mt-2 text-sm bd-ink2">Choose a new password for your account.</p>

          {!token ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4 text-sm bd-ink2">
              Missing reset token. Please use the link from your email.
            </div>
          ) : ok ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4 text-sm bd-ink2">
                Password updated. You can log in now.
              </div>
              <a className="bd-btn bd-btn-primary w-full text-center" href="/auth/login">
                Go to login
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">New password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                />
                <div className="mt-1 text-xs bd-ink2">Minimum 8 characters.</div>
                {pwTooShort ? (
                  <div className="mt-1 text-xs font-semibold text-red-700">Must be at least 8 characters.</div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Confirm new password</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                />
                <div className="mt-1 text-xs bd-ink2">Must match.</div>
                {pwMismatch ? (
                  <div className="mt-1 text-xs font-semibold text-red-700">Passwords do not match.</div>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cx("bd-btn bd-btn-primary w-full", (!canSubmit) && "opacity-70 cursor-not-allowed")}
              >
                {loading ? "Saving..." : "Set new password"}
              </button>
            </form>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <a className="bd-link" href="/auth/login">Back to login</a>
            <span className="text-black/20">•</span>
            <a className="bd-link" href="/legal/privacy">Privacy</a>
            <span className="text-black/20">•</span>
            <a className="bd-link" href="/legal/terms">Terms</a>
          </div>
        </div>
      </div>
    </main>
  );
}
