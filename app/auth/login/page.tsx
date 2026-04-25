"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Button, Input } from "@/components/ui";

function friendlyAuthError(raw: string) {
  const s = String(raw || "");
  if (s === "EMAIL_NOT_VERIFIED") return "Please verify your email before logging in. Use the resend link above if you cannot find it.";
  if (s === "CredentialsSignin") return "Incorrect email or password.";
  if (s.toLowerCase().includes("credentials")) return "Incorrect email or password.";
  if (s.toLowerCase().includes("signin")) return "Incorrect email or password.";
  if (s.toLowerCase().includes("too many login attempts")) return "Too many login attempts. Please wait 15 minutes and try again.";
  return "Could not log you in. Please check your details and try again.";
}

export default function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const err = (sp?.get("error") || "").toString().trim();
    const verify = (sp?.get("verify") || "").toString().trim();
    const resend = (sp?.get("resend") || "").toString().trim();

    setError(null);
    setNotice(null);

    if (verify) {
      if (verify === "ok") setNotice("Email verified. You can log in now.");
      else if (verify === "missing") setError("Verification link is missing or invalid.");
      else if (verify === "expired") setError("That verification link has expired. Please request a new one.");
      else setError("Verification failed. Please try again.");
      return;
    }

    if (resend) {
      setNotice("Verification email resent. Please check your inbox.");
      return;
    }

    if (err) {
      setError(friendlyAuthError(err));
    }
  }, [sp]);

  return (
    <main className="bd-container py-5 sm:py-10">
      <div className="container max-w-5xl space-y-4 sm:space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Welcome back</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Log in to Bidra</h1>
            <p className="mt-2 text-sm bd-ink2 sm:text-base">
              Access your listings, messages, sold items, and account tools.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="order-2 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:order-1">
            <div className="text-sm font-extrabold bd-ink">Before you log in</div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-sm font-semibold bd-ink">New account?</div>
                <div className="mt-1 text-sm bd-ink2">
                  You must <b>verify your email</b> before you can log in. Check your inbox for the verification link.
                </div>
                <div className="mt-2 text-xs bd-ink2">
                  Did not get it?{" "}
                  <Link className="bd-link font-semibold" href="/auth/verify">Resend verification email</Link>.
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-sm font-semibold bd-ink">Why this matters</div>
                <ul className="mt-2 list-disc pl-5 text-sm bd-ink2 space-y-2">
                  <li>Email verification helps protect account access and trust.</li>
                  <li>Bidra keeps core buying and selling activity inside your account.</li>
                  <li>Age verification continues separately after account access where required.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-sm font-semibold bd-ink">Need help?</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link href="/forgot-password" className="bd-btn bd-btn-ghost">Reset password</Link>
                  <Link href="/support" className="bd-btn bd-btn-ghost">Support</Link>
                </div>
              </div>
            </div>
          </Card>

          <Card className="order-1 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:order-2">
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setNotice(null);

                const fd = new FormData(e.currentTarget);
                const email = String(fd.get("email") ?? "");
                const password = String(fd.get("password") ?? "");

                const res = await signIn("credentials", {
                  email,
                  password,
                  redirect: false,
                });

                if (!res) {
                  setError("Could not reach the sign-in service. Please try again.");
                  return;
                }

                if (res.error) {
                  setError(friendlyAuthError(res.error));
                  return;
                }

                const next = sp?.get("next");
                router.push(next && next.startsWith("/") ? next : "/");
                router.refresh();
              }}
            >
              <div>
                <div className="text-sm font-extrabold bd-ink">Account login</div>
                <div className="mt-1 text-sm bd-ink2">
                  Use your email and password to continue.
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="mt-1 flex gap-2">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className="flex-1"
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
              </div>

              <div className="flex items-center justify-between gap-3">
                <Link href="/forgot-password" className="bd-link text-sm">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="bd-btn bd-btn-primary w-full">
                Log in
              </Button>

              {notice ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 break-words">
                  {notice}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 break-words">
                  {error}
                </div>
              ) : null}

              <div className="text-sm text-neutral-700">
                Do not have an account?{" "}
                <Link href="/auth/register" className="bd-link">
                  Create one
                </Link>
                .
              </div>

              <div className="pt-2 text-xs text-black/60">
                By continuing, you agree to our{" "}
                <Link href="/legal/terms" className="bd-link">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="bd-link">
                  Privacy Policy
                </Link>
                .
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
