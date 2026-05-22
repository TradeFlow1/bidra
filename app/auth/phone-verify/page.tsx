import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function PhoneVerifyPage() {
  return (
    <PublicContentPage title="Phone verification" subtitle="Add another layer of trust to your Bidra account.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <form action="/api/auth/phone/confirm" method="post" className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-[#0F172A]">Verification code</span>
            <input name="code" className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Enter code" />
          </label>
          <button type="submit" className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black text-white">Verify phone</button>
        </form>
        <Link href="/account" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to account</Link>
      </section>
    </PublicContentPage>
  );
}
