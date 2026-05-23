import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function ForgotPasswordPage() {
  return (
    <PublicContentPage title="Reset password" subtitle="Enter your email and we will send reset instructions.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm hover:bg-[#F5F3FF]">
        <form action="/api/auth/password-reset/request" method="post" className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">Email</span>
            <input name="email" type="email" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="you@example.com" />
          </label>
          <button type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white !text-white disabled:!text-white">Send reset link</button>
        </form>
        <Link href="/auth/login" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to sign in</Link>
      </section>
    </PublicContentPage>
  );
}
