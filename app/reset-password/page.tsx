import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function ResetPasswordPage() {
  return (
    <PublicContentPage title="Choose a new password" subtitle="Create a secure password for your Bidra account.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <form action="/api/auth/password-reset/confirm" method="post" className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">New password</span>
            <input name="password" type="password" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="New password" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">Confirm password</span>
            <input name="confirmPassword" type="password" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Re-enter password" />
          </label>
          <button type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white hover:bg-[#4338CA]">Update password</button>
        </form>
        <Link href="/auth/login" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to sign in</Link>
      </section>
    </PublicContentPage>
  );
}
