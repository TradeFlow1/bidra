"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const dobDay = String(form.get("dobDay") || "").trim().padStart(2, "0");
    const dobMonth = String(form.get("dobMonth") || "").trim().padStart(2, "0");
    const dobYear = String(form.get("dobYear") || "").trim();
    const termsAccepted = form.get("termsAccepted") === "on";

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    if (!dobDay || !dobMonth || !dobYear) {
      setError("Date of birth is required.");
      setSubmitting(false);
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms and confirm you are 18+ to create an account.");
      setSubmitting(false);
      return;
    }

    const payload = {
      email: String(form.get("email") || "").trim(),
      password,
      username: String(form.get("username") || "").trim(),
      dob: dobYear + "-" + dobMonth + "-" + dobDay,
      country: "AU",
      postcode: String(form.get("postcode") || "").trim(),
      suburb: String(form.get("suburb") || "").trim(),
      state: String(form.get("state") || "").trim(),
      termsAccepted,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(String(data.error || "Could not create account. Please check the details and try again."));
        setSubmitting(false);
        return;
      }

      router.push("/auth/register/success");
    } catch {
      setError("Could not create account. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <Link href="/" className="mb-4 inline-flex h-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-black text-[#4F46E5] shadow-sm hover:bg-[#F8FAFC]">
          ← Back to marketplace
        </Link>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-5">
            <section className="rounded-[32px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Join Bidra</div>
              <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-[#07152E]">Create your account</h1>
              <p className="mt-4 text-base font-semibold text-[#475569]">Create an account to buy, sell, message, and manage listings.</p>
            </section>

            <section className="rounded-[28px] border border-[#D7E2F1] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-black text-[#07152E]">Account setup</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
                  <h3 className="text-sm font-black">Password confidence</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold leading-6 text-[#64748B]">
                    <li>Use at least 8 characters.</li>
                    <li>Use a strong password.</li>
                    <li>Check both password fields before submitting.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
                  <h3 className="text-sm font-black">Email verification required</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">After you sign up, we will email you a verification link. Verify your email before you can log in.</p>
                </div>
                <div className="rounded-2xl border border-[#D7E2F1] bg-white p-4">
                  <h3 className="text-sm font-black">Age requirement</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Accounts are 18+.</p>
                </div>
                <div className="rounded-2xl border border-[#D7E2F1] bg-white p-4">
                  <h3 className="text-sm font-black">Privacy-first location</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">We only ask for general area details like postcode, suburb, and state. No street address.</p>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[28px] border border-[#D7E2F1] bg-white p-5 shadow-[0_14px_45px_rgba(28,50,84,0.08)] sm:p-6">
            <h2 className="text-base font-black text-[#07152E]">Account registration</h2>
            <p className="mt-2 text-sm font-semibold text-[#64748B]">Complete the details below to activate browsing, watchlist, buying, selling, and messaging.</p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-black">Email</span>
                <input name="email" type="email" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="name@email.com" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black">Password</span>
                  <div className="mt-2 flex h-12 rounded-2xl border border-[#CBD5E1] bg-white">
                    <input name="password" type={showPassword ? "text" : "password"} required className="min-w-0 flex-1 rounded-2xl px-4 text-sm font-semibold outline-none" placeholder="At least 8 characters" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-sm font-black text-[#4F46E5]">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-black">Confirm password</span>
                  <div className="mt-2 flex h-12 rounded-2xl border border-[#CBD5E1] bg-white">
                    <input name="confirmPassword" type={showConfirm ? "text" : "password"} required className="min-w-0 flex-1 rounded-2xl px-4 text-sm font-semibold outline-none" placeholder="Re-enter password" />
                    <button type="button" onClick={() => setShowConfirm((value) => !value)} className="px-4 text-sm font-black text-[#4F46E5]">{showConfirm ? "Hide" : "Show"}</button>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-black">Username (unique)</span>
                <input name="username" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Choose a username" />
                <span className="mt-2 block text-xs font-semibold text-[#64748B]">Letters, numbers, underscore, dot.</span>
              </label>

              <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
                <span className="text-sm font-black">Date of birth</span>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input name="dobDay" inputMode="numeric" required className="h-12 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="DD" />
                  <input name="dobMonth" inputMode="numeric" required className="h-12 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="MM" />
                  <input name="dobYear" inputMode="numeric" required className="h-12 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="YYYY" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-black">Postcode</span>
                  <input name="postcode" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="4000" />
                </label>
                <label className="block">
                  <span className="text-sm font-black">Suburb</span>
                  <input name="suburb" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Brisbane City" />
                </label>
                <label className="block">
                  <span className="text-sm font-black">State</span>
                  <select name="state" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold">
                    <option value="">Select</option>
                    <option value="QLD">QLD</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="SA">SA</option>
                    <option value="WA">WA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </label>
              </div>

              <label className="flex gap-3 rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4 text-sm font-semibold leading-6 text-[#475569]">
                <input name="termsAccepted" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" />
                <span>I am 18+ and agree to Bidra&apos;s <Link href="/legal/terms" className="font-black text-[#4F46E5]">Terms</Link> and <Link href="/legal/privacy" className="font-black text-[#4F46E5]">Privacy Policy</Link>.</span>
              </label>

              <button type="submit" disabled={submitting} className="h-12 w-full rounded-2xl bg-[#4F46E5] text-sm font-black !text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 disabled:!text-white">{submitting ? "Creating account..." : "Create account"}</button>
            </form>

            <p className="mt-5 text-center text-sm font-semibold text-[#64748B]">
              Already have an account? <Link href="/auth/login" className="font-black text-[#4F46E5]">Sign in</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
