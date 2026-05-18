"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicContentPage } from "@/components/public-info-page";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PublicContentPage title="Sign in" subtitle="Access your Bidra account.">
      <div className="grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
          <form action="/api/auth/signin" method="post" className="space-y-5">
            <label className="block">
              <span className="text-sm font-black text-[#0F172A]">Email</span>
              <input name="email" type="email" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-[#0F172A]">Password</span>
              <div className="mt-2 flex h-12 rounded-2xl border border-[#CBD5E1] bg-white">
                <input name="password" type={showPassword ? "text" : "password"} className="min-w-0 flex-1 rounded-2xl px-4 text-sm font-semibold outline-none" placeholder="Password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-sm font-black text-[#4F46E5]">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <button type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white hover:bg-[#4338CA]">Sign in</button>
          </form>
          <p className="mt-5 text-center text-sm font-semibold text-[#64748B]">
            New to Bidra? <Link href="/auth/register" className="font-black text-[#4F46E5]">Create an account</Link>
          </p>
        </section>

        <aside className="space-y-4">
          <Link href="/auth/register" className="block rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm hover:bg-[#F5F3FF]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-xl font-black text-[#4F46E5]">＋</div>
            <h2 className="text-lg font-black text-[#0F172A]">Create an account</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Join Bidra to buy, sell and message local users.</p>
          </Link>
          <Link href="/forgot-password" className="block rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm hover:bg-[#F5F3FF]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-xl font-black text-[#4F46E5]">?</div>
            <h2 className="text-lg font-black text-[#0F172A]">Forgot password</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Reset your password and get back into your account.</p>
          </Link>
        </aside>
      </div>
    </PublicContentPage>
  );
}
