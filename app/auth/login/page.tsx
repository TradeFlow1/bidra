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
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#0F172A] sm:text-5xl">Sign in</h1>
        <p className="mt-3 text-lg font-extrabold text-[#0F172A]">Access your Bidra account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-[#D8E1F0] bg-white p-6 shadow-[0_14px_45px_rgba(28,50,84,0.08)] sm:p-8">
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

          <p className="mt-6 text-center text-sm font-semibold text-[#64748B]">
            New to Bidra?{" "}
            <Link href="/auth/register" className="font-black text-[#4F46E5]">Create an account</Link>
          </p>
        </section>

        <aside className="grid gap-4">
          <Link href="/auth/register" className="rounded-[28px] border border-[#D8E1F0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EEF2FF] text-xl font-black text-[#4F46E5]">+</div>
            <h2 className="mt-5 text-lg font-black text-[#0F172A]">Create an account</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Join Bidra to buy, sell and message local users.</p>
          </Link>

          <Link href="/forgot-password" className="rounded-[28px] border border-[#D8E1F0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EEF2FF] text-xl font-black text-[#4F46E5]">?</div>
            <h2 className="mt-5 text-lg font-black text-[#0F172A]">Forgot password</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Reset your password and get back into your account.</p>
          </Link>
        </aside>
      </div>
    </main>
  );
}