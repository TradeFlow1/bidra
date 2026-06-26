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
    <main className="bg-[#FBF9FF] px-4 py-6 text-[#120724] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <Link href="/" className="mb-4 inline-flex h-11 items-center justify-center rounded-2xl border border-[#DDD6FE] bg-white px-4 text-sm font-black text-[#2B1055] shadow-sm hover:bg-[#F5F3FF]">
          Back to marketplace
        </Link>

        <div className="grid overflow-hidden rounded-[34px] border border-[#EDE9FE] bg-white shadow-[0_28px_90px_rgba(43,16,85,0.12)] lg:grid-cols-[0.86fr_1.14fr]">
          <section className="relative overflow-hidden bg-[#120724] p-7 text-white sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(680px_300px_at_82%_0%,rgba(124,58,237,0.28),transparent_68%),linear-gradient(135deg,#10061F_0%,#160A2A_58%,#21103C_100%)]" />
            <div className="relative flex min-h-[420px] flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C4B5FD]">Join Bidra</div>
                <h1 className="mt-4 max-w-lg text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                  Create your marketplace account.
                </h1>
                <p className="mt-4 max-w-md text-base font-semibold leading-7 text-white/72">
                  Save items, message sellers, buy now, make offers and manage listings.
                </p>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-bold text-white/78">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">18+ Australian marketplace account</div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">Email verification required</div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">General location only</div>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 sm:p-7 lg:p-10">
            <h2 className="text-3xl font-black tracking-[-0.045em] text-[#120724]">Account registration</h2>
            <p className="mt-2 text-sm font-semibold text-[#62516F]">Complete the details below to continue.</p>

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
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-sm font-black text-[#5B21B6]">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-black">Confirm password</span>
                  <div className="mt-2 flex h-12 rounded-2xl border border-[#CBD5E1] bg-white">
                    <input name="confirmPassword" type={showConfirm ? "text" : "password"} required className="min-w-0 flex-1 rounded-2xl px-4 text-sm font-semibold outline-none" placeholder="Re-enter password" />
                    <button type="button" onClick={() => setShowConfirm((value) => !value)} className="px-4 text-sm font-black text-[#5B21B6]">{showConfirm ? "Hide" : "Show"}</button>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-black">Username</span>
                <input name="username" required className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Choose a username" />
              </label>

              <div className="rounded-2xl border border-[#EDE9FE] bg-[#FBF9FF] p-4">
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

              <label className="flex gap-3 rounded-2xl border border-[#EDE9FE] bg-[#FBF9FF] p-4 text-sm font-semibold leading-6 text-[#62516F]">
                <input name="termsAccepted" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" />
                <span>I am 18+ and agree to Bidra&apos;s <Link href="/legal/terms" className="font-black text-[#5B21B6]">Terms</Link> and <Link href="/legal/privacy" className="font-black text-[#5B21B6]">Privacy Policy</Link>.</span>
              </label>

              <button type="submit" disabled={submitting} className="bd-btn bd-btn-primary h-12 w-full rounded-2xl text-sm">
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm font-semibold text-[#62516F]">
              Already have an account? <Link href="/auth/login" className="font-black text-[#5B21B6]">Sign in</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
