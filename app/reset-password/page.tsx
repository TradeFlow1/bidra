"use client";

import Link from "next/link";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pwTooShort = useMemo(function () {
    return pw.length > 0 && pw.length < 8;
  }, [pw]);

  const pwMismatch = useMemo(function () {
    return pw2.length > 0 && pw !== pw2;
  }, [pw, pw2]);

  const canSubmit = useMemo(function () {
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
        body: JSON.stringify({ token: token, newPassword: pw }),
      });

      const data = await res.json().catch(function (): unknown { return {}; });
      if (!res.ok || !(data as any)?.ok) {
        setError("We could not reset your password. Please request a new link and try again.");
        return;
      }

      setOk(true);
    } catch {
      setError("We could not reset your password. Please try again shortly.");
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
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Reset password</h1>
            <p className="mt-2 text-sm bd-ink2 sm:text-base">
              Choose a new password for your account and continue back into Bidra securely.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">Before you continue</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold bd-ink">Use the email link</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Password resets must be completed from the secure link sent to your email address.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Choose a strong password</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Use a password that is easy for you to remember and hard for others to guess.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Need another route?</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/forgot-password" className="bd-btn bd-btn-ghost">Request new link</Link>
                    <Link href="/support" className="bd-btn bd-btn-ghost">Support</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            {!token ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  Missing reset token. Please use the link from your email.
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link className="bd-btn bd-btn-primary w-full text-center" href="/forgot-password">
                    Request new link
                  </Link>
                  <Link className="bd-btn bd-btn-ghost w-full text-center" href="/auth/login">
                    Back to login
                  </Link>
                </div>
              </div>
            ) : ok ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Password updated. You can log in now.
                </div>
                <Link className="bd-btn bd-btn-primary w-full text-center" href="/auth/login">
                  Go to login
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-extrabold bd-ink">Set a new password</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Enter and confirm your new password below.
                  </div>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">New password</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="bd-btn bd-btn-ghost whitespace-nowrap"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword ? "true" : "false"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="mt-1 text-xs bd-ink2">Minimum 8 characters.</div>
                    {pwTooShort ? (
                      <div className="mt-1 text-xs font-semibold text-red-700">Must be at least 8 characters.</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Confirm new password</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={pw2}
                        onChange={(e) => setPw2(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="bd-btn bd-btn-ghost whitespace-nowrap"
                        aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                        aria-pressed={showConfirmPassword ? "true" : "false"}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="mt-1 text-xs bd-ink2">Must match.</div>
                    {pwMismatch ? (
                      <div className="mt-1 text-xs font-semibold text-red-700">Passwords do not match.</div>
                    ) : null}
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cx("bd-btn bd-btn-primary w-full", !canSubmit && "opacity-70 cursor-not-allowed")}
                  >
                    {loading ? "Saving..." : "Set new password"}
                  </button>
                </form>
              </>
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
