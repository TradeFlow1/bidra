import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function PhoneVerifyPage() {
  return (
    <PublicContentPage title="Phone verification" subtitle="Add another layer of trust to your Bidra account.">
      <section className="max-w-2xl rounded-[24px] border border-[#D8E1F0] bg-white p-8 shadow-sm">
        <form action="/api/auth/phone/confirm" method="post" className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">Verification code</span>
            <input name="code" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#07152E] placeholder:text-[#94A3B8] outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]" placeholder="Enter code" />
          </label>
          <button type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white !text-white disabled:!text-white">Verify phone</button>
        </form>
        <Link href="/account" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to account</Link>
      </section>
    </PublicContentPage>
  );
}
