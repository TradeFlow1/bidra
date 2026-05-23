import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function RegisterSuccessPage() {
  return (
    <PublicContentPage title="Check your email" subtitle="Your Bidra account is almost ready.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm hover:bg-[#F5F3FF]">
        <p className="text-base font-semibold leading-7 text-[#475569]">We sent a verification link to your email. Open it to activate your account, then sign in.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white hover:bg-[#4338CA] disabled:!text-white">Sign in</Link>
          <Link href="/help" className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-6 text-sm font-black text-[#4F46E5] hover:bg-[#F5F3FF]">Get help</Link>
        </div>
      </section>
    </PublicContentPage>
  );
}
