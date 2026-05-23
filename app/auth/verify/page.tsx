import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicContentPage } from "@/components/public-info-page";

export default function VerifyPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = typeof searchParams?.token === "string" ? searchParams.token.trim() : "";

  if (token) {
    redirect("/api/auth/verify?token=" + encodeURIComponent(token));
  }

  return (
    <PublicContentPage title="Verify your account" subtitle="Confirm your email to finish setting up Bidra.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm hover:bg-[#F5F3FF]">
        <p className="text-base font-semibold leading-7 text-[#475569]">Open the verification link we sent to your email. If the link has expired, request a new one from the sign in page.</p>
        <Link href="/auth/login" className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white hover:bg-[#4338CA] disabled:!text-white">Back to sign in</Link>
      </section>
    </PublicContentPage>
  );
}