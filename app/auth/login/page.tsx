"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Button, Input } from "@/components/ui";

function friendlyAuthError(raw: string) {
  const s = String(raw || "");
  // NextAuth common codes:
  if (s === "CredentialsSignin") return "Incorrect email or password.";
  if (s.toLowerCase().includes("credentials")) return "Incorrect email or password.";
  if (s.toLowerCase().includes("signin")) return "Incorrect email or password.";
  if (s.toLowerCase().includes("too many login attempts")) return "Too many login attempts. Please wait 15 minutes and try again.";
    return "Couldn’t log you in. Please check your details and try again.";
}

export default function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Show friendly messages when we arrive from auth flows (/auth/login?error=..., ?verify=..., ?resend=...)
  useEffect(() => {
    const err = (sp?.get("error") || "").toString().trim();
    const verify = (sp?.get("verify") || "").toString().trim();
    const resend = (sp?.get("resend") || "").toString().trim();

    // Reset first so we never show stale text after navigation
    setError(null);
    setNotice(null);

    if (verify) {
      if (verify === "ok") setNotice("Email verified — you can log in now.");
      else if (verify === "missing") setError("Verification link is missing or invalid.");
      else if (verify === "expired") setError("That verification link has expired. Please request a new one.");
      else setError("Verification failed. Please try again.");
      return;
    }

    if (resend) {
      // /api/auth/resend-verification redirects to /auth/login?resend=1
      setNotice("Verification email resent. Please check your inbox.");
      return;
    }

    if (err) {
      setError(friendlyAuthError(err));
    }
  }, [sp]);

  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-neutral-700">Use your email and password.</p>

        <Card className="mt-4">
          <form
            noValidate
            className="flex flex-col gap-3"
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
                setError("Couldn’t reach the sign-in service. Please try again.");
                return;
              }

              if (res.error) {
                setError(friendlyAuthError(res.error));
                return;
              }

              // FORCE LOCAL RELATIVE REDIRECT (prevents jumping to vercel in dev)
              const next = sp?.get("next");
              router.push(next && next.startsWith("/") ? next : "/");
              router.refresh();
            }}
          >
            <label className="text-sm">Email</label>
            <Input name="email" type="email" required />

            <label className="text-sm">Password</label>
            <Input name="password" type="password" required />

            <div className="mt-2 text-sm">
              <Link href="/forgot-password" className="bd-link text-sm">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="bd-btn bd-btn-primary">
              Log in
            </Button>

            {notice ? (
              <div className="text-sm text-green-700 break-words">
                {notice}
              </div>
            ) : null}

            {/* Bottom-of-form friendly error (no raw auth codes) */}
            {error ? (
              <div className="text-sm text-red-700 break-words">
                {error}
              </div>
            ) : null}

            <div className="text-sm text-neutral-700">
              Don&apos;t have an account?{" "}
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
    </main>
  );
}
