"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    if (!email || !password) {
      setLoading(false);
      setError("Enter your email and password.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Sign in failed. Check your email and password, then try again.");
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  }

  return (
    <main className="bg-[#FBF9FF] px-4 py-6 text-[#120724] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[34px] border border-[#EDE9FE] bg-white shadow-[0_28px_90px_rgba(43,16,85,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#120724] p-7 text-white sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(680px_300px_at_82%_0%,rgba(124,58,237,0.28),transparent_68%),linear-gradient(135deg,#10061F_0%,#160A2A_58%,#21103C_100%)]" />
          <div className="relative flex min-h-[360px] flex-col justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C4B5FD]">Account</div>
              <h1 className="mt-4 max-w-lg text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">Welcome back.</h1>
              <p className="mt-4 max-w-md text-base font-semibold leading-7 text-white/72">Open saved listings, messages, orders and seller tools.</p>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-bold text-white/78 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">Saved listings</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">Messages</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">Orders</div>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-7">
            <h2 className="text-3xl font-black tracking-[-0.045em] text-[#120724]">Sign in</h2>
            <p className="mt-2 text-sm font-semibold text-[#62516F]">Use your email and password to continue.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-black text-[#0F172A]">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#0F172A]">Password</span>
              <span className="mt-2 flex h-12 overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white transition focus-within:border-[#4F46E5] focus-within:ring-4 focus-within:ring-[#C7D2FE]">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="min-w-0 flex-1 px-4 text-sm font-semibold outline-none"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="px-4 text-sm font-black text-[#4F46E5]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 !text-white disabled:!text-white"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[#62516F]">
            New to Bidra?{" "}
            <Link href="/auth/register" className="font-black text-[#5B21B6]">Create an account</Link>
          </p>
        </section>
      </div>
      <div className="mx-auto mt-4 flex w-full max-w-[1180px] flex-col gap-3 sm:flex-row">
        <Link href="/auth/register" className="flex min-h-14 flex-1 items-center justify-between rounded-2xl border border-[#EDE9FE] bg-white px-5 text-sm font-black text-[#120724] shadow-sm hover:bg-[#F5F3FF]">
          Create an account <span className="text-[#7C3AED]">Join</span>
        </Link>
        <Link href="/forgot-password" className="flex min-h-14 flex-1 items-center justify-between rounded-2xl border border-[#EDE9FE] bg-white px-5 text-sm font-black text-[#120724] shadow-sm hover:bg-[#F5F3FF]">
          Forgot password <span className="text-[#7C3AED]">Reset</span>
        </Link>
      </div>
    </main>
  );
}
