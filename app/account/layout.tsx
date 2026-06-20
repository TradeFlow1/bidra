import type { ReactNode } from "react";
import Link from "next/link";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <section id="security" className="bg-white px-4 pb-24 text-[#0F172A] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Security</div>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Change password</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
                  Use the secure reset flow to change your Bidra account password. We will email a reset link to your account address.
                </p>
              </div>
              <Link href="/forgot-password" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white">
                Send reset link
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
