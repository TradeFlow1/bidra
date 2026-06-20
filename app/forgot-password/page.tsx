import Link from "next/link";
import { PublicContentPage } from "@/components/public-info-page";
import AccountRecoveryForm from "@/components/account-recovery-form";

export default function ForgotPasswordPage() {
  return (
    <PublicContentPage title="Reset password" subtitle="Enter your email and we will send reset instructions.">
      <section className="max-w-2xl rounded-[24px] border border-[#D8E1F0] bg-white p-8 shadow-sm">
        <AccountRecoveryForm />
        <Link href="/auth/login" className="mt-5 block text-center text-sm font-black text-[#4F46E5]">Back to sign in</Link>
      </section>
    </PublicContentPage>
  );
}
