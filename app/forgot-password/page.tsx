"use client";

import Link from "next/link";
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

  const canSubmit = useMemo(function () {
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

      const data = await res.json().catch(function (): unknown { return {}; });

      setDone(true);
      if (data && typeof (data as any).resetUrl === "string") setResetUrl((data as any).resetUrl);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Account recovery</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Forgot password</h1>
            <p className="mt-2 text-sm bd-ink2 sm:text-base">
              Enter your email address and we will send a password reset link if an account exists for it.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">How recovery works</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold bd-ink">Privacy-first</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Bidra does not reveal whether a specific email address has an account during password recovery.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Use the same email</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Enter the email address you used when creating your Bidra account.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Need another route?</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/auth/login" className="bd-btn bd-btn-ghost">Back to login</Link>
                    <Link href="/support" className="bd-btn bd-btn-ghost">Support</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            {!done ? (
              <>
                <div>
                  <div className="text-sm font-extrabold bd-ink">Send reset link</div>
                  <div className="mt-1 text-sm bd-ink2">
                    We will email instructions for resetting your password.
                  </div>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cx("bd-btn bd-btn-primary w-full", !canSubmit && "opacity-70 cursor-not-allowed")}
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  If an account exists for that email, a reset link has been sent.
                </div>

                {resetUrl ? (
                  <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 text-sm">
                    <div className="font-extrabold bd-ink">Dev link</div>
                    <a className="bd-link break-all" href={resetUrl}>
                      {resetUrl}
                    </a>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link className="bd-btn bd-btn-primary w-full text-center" href="/auth/login">
                    Back to login
                  </Link>
                  <Link className="bd-btn bd-btn-ghost w-full text-center" href="/support">
                    Support
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <Link className="bd-link" href="/auth/login">Back to login</Link>
              <span className="text-black/20">•</span>
              <Link className="bd-link" href="/legal/privacy">Privacy</Link>
              <span className="text-black/20">•</span>
              <Link className="bd-link" href="/legal/terms">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
