"use client";

import { useMemo, useState } from "react";



function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return !loading && email.trim().length > 0;
  }, [email, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setResetUrl(null);

    const v = email.trim().toLowerCase();
    if (!v) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });

      const data = await res.json().catch(() => ({} as any));

      // Always show success (non-enumerating)
      setDone(true);
      if (data && typeof data.resetUrl === "string") setResetUrl(data.resetUrl);
    } catch {
      // Still show success to avoid leaking anything
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="bd-card p-5 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Forgot password</h1>
          <p className="mt-2 text-sm bd-ink2">Enter your email address and we’ll send you a reset link.</p>

          {done ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4 text-sm bd-ink2">
                If an account exists for that email, a reset link has been sent.
              </div>

              {resetUrl ? (
                <div className="rounded-xl border border-black/10 bg-white p-4 text-sm">
                  <div className="font-extrabold bd-ink">Dev link</div>
                  <a className="bd-link break-all" href={resetUrl}>
                    {resetUrl}
                  </a>
                </div>
              ) : null}

              <a className="bd-btn bd-btn-primary w-full text-center" href="/auth/login">
                Back to login
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cx("bd-btn bd-btn-primary w-full", (!canSubmit) && "opacity-70 cursor-not-allowed")}
              >
                {loading ? "Sending..." : "Send reset link"}
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
