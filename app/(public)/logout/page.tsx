import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";

export default function LogoutPage() {
  return (
    <PublicContentPage title="Signed out" subtitle="You have been signed out of Bidra.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-base font-semibold leading-7 text-[#475569]">You can continue browsing listings or sign back in when you are ready.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/listings" className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-6 text-sm font-black text-[#4F46E5] hover:bg-[#F5F3FF]">Browse listings</Link>
          <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white hover:bg-[#4338CA]">Sign in</Link>
        </div>
      </section>
    </PublicContentPage>
  );
}
