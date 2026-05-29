"use client";

import Link from "next/link";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { PublicContentPage } from "@/components/public-info-page";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <PublicContentPage title="Signing out" subtitle="Ending your Bidra session.">
      <section className="max-w-2xl rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-base font-semibold leading-7 text-[#475569]">You are being signed out. If you are not redirected, use the button below.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black text-white hover:bg-[#4338CA] !text-white disabled:!text-white">Sign out now</button>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-6 text-sm font-black text-[#4F46E5]">Back to home</Link>
        </div>
      </section>
    </PublicContentPage>
  );
}