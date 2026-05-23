import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function ResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = typeof searchParams?.token === "string" ? searchParams.token.trim() : "";

  return (
    <PublicContentPage title="Choose a new password" subtitle="Create a secure password for your Bidra account.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm hover:bg-[#F5F3FF]">
        {!token ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            Missing reset token. Please use the link from your email or request a new password reset link.
          </div>
        ) : null}
        <form action="/api/auth/password-reset/confirm" method="post" className="mt-5 space-y-5">
          <input type="hidden" name="token" value={token} />
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">New password</span>
            <input name="password" type="password" minLength={8} required disabled={!token} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]" placeholder="New password" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">Confirm password</span>
            <input name="confirmPassword" type="password" minLength={8} required disabled={!token} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]" placeholder="Re-enter password" />
          </label>
          <button type="submit" disabled={!token} className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 !text-white disabled:!text-white">Update password</button>
        </form>
        <Link href="/auth/login" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to sign in</Link>
      </section>
    </PublicContentPage>
  );
}