import type { ReactNode } from "react";
import AccountSecurityForm from "@/components/account-security-form";
import { SavedSearchesPanel } from "@/components/saved-searches";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <section id="saved-searches" className="bg-white px-4 pb-6 text-[#0F172A] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <SavedSearchesPanel />
        </div>
      </section>
      <section id="security" className="bg-white px-4 pb-24 text-[#0F172A] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:p-6">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Security</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight">Change password</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
                Update your password inside Bidra by entering your current password and choosing a new one.
              </p>
            </div>
            <AccountSecurityForm />
          </div>
        </div>
      </section>
    </>
  );
}
