"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";
import LocationSuggest from "./location-suggest";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  dob: string;
  postcode: string;
  suburb: string;
  state: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function DobSelect(props: { value: string; onChange: (v: string) => void }) {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(props.value ?? ""));

  const [yy, setYy] = useState(parsed ? parsed[1] : "");
  const [mm, setMm] = useState(parsed ? parsed[2] : "");
  const [dd, setDd] = useState(parsed ? parsed[3] : "");

  useEffect(() => {
    const next = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(props.value ?? ""));
    setYy(next ? next[1] : "");
    setMm(next ? next[2] : "");
    setDd(next ? next[3] : "");
  }, [props.value]);

  const now = new Date();
  const maxYear = now.getFullYear() - 18;
  const minYear = maxYear - 120;

  const days = Array.from({ length: 31 }, function (_, i) { return String(i + 1).padStart(2, "0"); });
  const months = Array.from({ length: 12 }, function (_, i) { return String(i + 1).padStart(2, "0"); });
  const years = Array.from({ length: (maxYear - minYear + 1) }, function (_, i) { return String(maxYear - i); });

  function emit(nextY: string, nextM: string, nextD: string) {
    if (nextY && nextM && nextD) props.onChange(nextY + "-" + nextM + "-" + nextD);
    else props.onChange("");
  }

  return (
    <div className="relative z-20 mt-3 grid grid-cols-3 gap-2 pointer-events-auto">
      <select
        className="bd-input relative z-20 pointer-events-auto appearance-auto"
        value={dd}
        onChange={(e) => {
          const next = e.target.value;
          setDd(next);
          emit(yy, mm, next);
        }}
        aria-label="Day"
      >
        <option value="">DD</option>
        {days.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
      </select>

      <select
        className="bd-input relative z-20 pointer-events-auto appearance-auto"
        value={mm}
        onChange={(e) => {
          const next = e.target.value;
          setMm(next);
          emit(yy, next, dd);
        }}
        aria-label="Month"
      >
        <option value="">MM</option>
        {months.map(function (m2) { return <option key={m2} value={m2}>{m2}</option>; })}
      </select>

      <select
        className="bd-input relative z-20 pointer-events-auto appearance-auto"
        value={yy}
        onChange={(e) => {
          const next = e.target.value;
          setYy(next);
          emit(next, mm, dd);
        }}
        aria-label="Year"
      >
        <option value="">YYYY</option>
        {years.map(function (y) { return <option key={y} value={y}>{y}</option>; })}
      </select>
    </div>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTouched, setAgreeTouched] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    dob: "",
    postcode: "",
    suburb: "",
    state: "",
  });

  const locationQuery = useMemo(function () {
    const pc = form.postcode.trim();
    const sb = form.suburb.trim();
    const st = form.state.trim();

    const digits = pc.replace(/\D/g, "");
    if (digits.length === 4) return digits;
    if (sb.length >= 3) return sb;

    return (pc + " " + sb + " " + st).trim();
  }, [form.postcode, form.suburb, form.state]);

  const pwTooShort = useMemo(function () {
    return form.password.length > 0 && form.password.length < 8;
  }, [form.password]);

  const pwPolicy = useMemo(function () {
    return checkPasswordPolicy(form.password);
  }, [form.password]);

  const pwMismatch = useMemo(function () {
    return form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  const canSubmit = useMemo(function () {
    const emailOk = form.email.trim().length > 0;
    const userOk = form.username.trim().length >= 3;
    const dobOk = form.dob.trim().length > 0;
    const pwOk = form.password.length >= 8;
    const confirmOk = form.confirmPassword.length >= 8 && form.password === form.confirmPassword;
    const locationOk = form.postcode.trim().length > 0 && form.suburb.trim().length > 0 && form.state.trim().length > 0;
    return emailOk && userOk && dobOk && pwOk && confirmOk && locationOk && agreeTerms && !loading;
  }, [form, agreeTerms, loading]);

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(function (p) { return { ...p, [k]: v }; });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAgreeTouched(true);

    if (!agreeTerms) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      setLoading(false);
      return;
    }

    if (pwTooShort) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (pwMismatch) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!form.confirmPassword) {
      setError("Please confirm your password.");
      setLoading(false);
      return;
    }

    if (!canSubmit) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const payload = {
      email: form.email.trim(),
      password: form.password,
      username: form.username.trim(),
      dob: form.dob.trim(),
      country: "AU",
      postcode: form.postcode.trim(),
      suburb: form.suburb.trim(),
      state: form.state.trim(),
      termsAccepted: agreeTerms,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(function (): unknown { return {}; });
    if (!res.ok) {
      const apiError = data && typeof (data as any).error === "string" ? String((data as any).error) : "";
      if (apiError) {
        setError(apiError + " Check the highlighted form guidance and try again.");
      } else {
        setError("We could not create your account. Please check your details, password guidance, and verification requirements, then try again.");
      }
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
    window.location.href = "/auth/register/success";
  }

  const shell = "bd-container py-5 sm:py-10";
  const label = "text-sm font-medium";
  const helper = "mt-1 text-xs text-black/55";
  const input = "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5";

  return (
    <main className={shell}>
      <div className="container max-w-6xl space-y-4 sm:space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Join Bidra</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Create your free marketplace account</h1>
            <p className="mt-2 text-sm bd-ink2 sm:text-base">
              Set up your Bidra account, verify your email, add your general location, and start buying, selling, watching, and messaging with trust signals.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="order-2 space-y-4 sm:space-y-5 lg:order-1">
            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
              <div className="text-sm font-extrabold bd-ink">Activate your account with trust basics</div>
              <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-3.5 sm:p-4">
                  <div className="text-sm font-semibold bd-ink">Password confidence</div>
                  <ul className="mt-2 list-disc pl-5 text-sm bd-ink2 space-y-2">
                    <li>Use at least 8 characters.</li>
                    <li>Use a password that is hard to guess and not reused from another site.</li>
                    <li>Use the Show buttons to check both password fields before creating your account.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-3.5 sm:p-4">
                  <div className="text-sm font-semibold bd-ink">Email verification required</div>
                  <div className="mt-1 text-sm bd-ink2">
                    After you sign up, we will email you a verification link. <b>Verify your email before you can log in.</b>
                  </div>
                  <div className="mt-2 text-xs bd-ink2">
                    Did not get the email? You can resend it on the{" "}
                    <Link className="bd-link font-semibold" href="/auth/verify">Verify email</Link> page.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-3.5 sm:p-4">
                  <div className="text-sm font-semibold bd-ink">Age requirement</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Bidra accounts are <span className="font-semibold text-[#0b1220]">18+</span>. Under 18s may browse but cannot create accounts.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-3.5 sm:p-4">
                  <div className="text-sm font-semibold bd-ink">Privacy-first location</div>
                  <div className="mt-1 text-sm bd-ink2">
                    We only ask for general area details like postcode, suburb, and state. No street address.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:order-2">
            {ok ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-lg font-extrabold text-[#0b1220]">Account created</p>
                <p className="mt-1 text-sm text-black/60">
                  Your account was created. Check your email and verify your account before logging in.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link href="/auth/login" className="bd-btn bd-btn-primary text-center">
                    Go to login
                  </Link>
                  <Link href="/" className="bd-btn text-center">
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-extrabold bd-ink">Account registration</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Complete the details below to activate browsing, watchlist, buying, selling, and messaging.
                  </div>
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-600/20 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                  </div>
                ) : null}

                <form noValidate onSubmit={onSubmit} className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                  <div>
                    <label className={label}>Email</label>
                    <input
                      className={input}
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="name@email.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label}>Password</label>
                      <div className="mt-1 flex gap-2">
                        <input
                          className={cx(input, "mt-0 flex-1")}
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={form.password}
                          onChange={(e) => setField("password", e.target.value)}
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="bd-btn bd-btn-ghost whitespace-nowrap"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword ? "true" : "false"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className={helper}>{passwordGuidanceText()}</p>
                      {pwTooShort ? (
                        <p className="mt-1 text-xs font-semibold text-red-700">Must be at least 8 characters.</p>
                      ) : null}
                      {!pwTooShort && form.password.length > 0 && pwPolicy && pwPolicy.warning ? (
                        <p className="mt-1 text-xs font-semibold text-amber-800">
                          {(pwPolicy.label ? "Password strength: " + pwPolicy.label.toUpperCase() + ". " : "") + pwPolicy.warning}
                        </p>
                      ) : null}
                      {!pwTooShort && form.password.length > 0 && pwPolicy && !pwPolicy.ok && pwPolicy.reason ? (
                        <p className="mt-1 text-xs font-semibold text-red-700">{pwPolicy.reason}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className={label}>Confirm password</label>
                      <div className="mt-1 flex gap-2">
                        <input
                          className={cx(input, "mt-0 flex-1")}
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={form.confirmPassword}
                          onChange={(e) => setField("confirmPassword", e.target.value)}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="bd-btn bd-btn-ghost whitespace-nowrap"
                          aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                          aria-pressed={showConfirmPassword ? "true" : "false"}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className={helper}>Must match your password.</p>
                      {pwMismatch ? (
                        <p className="mt-1 text-xs font-semibold text-red-700">Passwords do not match.</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className={label}>Username (unique)</label>
                    <input
                      className={input}
                      required
                      minLength={3}
                      maxLength={24}
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                      placeholder="Choose a username"
                      autoComplete="username"
                    />
                    <p className={helper}>Letters, numbers, underscore, dot.</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 sm:p-5">
                    <label className={label}>Date of birth</label>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-semibold text-[#0b1220]">18+ only</div>
                        <div className="text-black/60">Under 18s may browse, but cannot create an account.</div>
                      </div>
                      <div className="text-xs text-black/60">Used only to enforce 18+.</div>
                    </div>

                    <DobSelect value={form.dob} onChange={(v) => setField("dob", v)} />
                    <p className="mt-2 text-xs text-black/60">Format: <span className="font-semibold">DD/MM/YYYY</span></p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-[#0b1220]">Location</p>
                      <p className="text-xs text-black/55">Country: AU</p>
                    </div>
                    <p className="mt-1 text-sm text-black/60">Enter <span className="font-semibold">postcode</span>, <span className="font-semibold">suburb</span>, and <span className="font-semibold">state</span>. No street address.</p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className={label}>Postcode</label>
                        <input
                          className={input}
                          value={form.postcode}
                          onChange={(e) => setField("postcode", e.target.value)}
                          placeholder="e.g. 4301"
                          inputMode="numeric"
                        />
                        <p className={helper}>Fastest option.</p>
                      </div>

                      <div className="sm:col-span-1">
                        <label className={label}>Suburb</label>
                        <input
                          className={input}
                          value={form.suburb}
                          onChange={(e) => setField("suburb", e.target.value)}
                          placeholder="e.g. Redbank Plains"
                        />

                        <label className={cx(label, "mt-3 block")}>State</label>
                        <select
                          className={input}
                          value={form.state}
                          onChange={(e) => setField("state", e.target.value)}
                          autoComplete="address-level1"
                        >
                          <option value="">Select state/territory…</option>
                          <option value="QLD">QLD</option>
                          <option value="NSW">NSW</option>
                          <option value="VIC">VIC</option>
                          <option value="WA">WA</option>
                          <option value="SA">SA</option>
                          <option value="TAS">TAS</option>
                          <option value="ACT">ACT</option>
                          <option value="NT">NT</option>
                        </select>
                        <p className={helper}>Choose your state or territory.</p>
                      </div>
                    </div>

                    <LocationSuggest
                      query={locationQuery}
                      onPick={(x) => {
                        setField("postcode", x.postcode);
                        setField("suburb", x.suburb);
                        setField("state", x.state);
                      }}
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0b1220]">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => { setAgreeTerms(e.target.checked); setAgreeTouched(true); }}
                      className="mt-1 h-4 w-4 accent-[var(--bidra-blue)] border border-black/30 bg-white"
                      required
                    />
                    <span>
                      I agree to Bidra&apos;s{" "}
                      <Link href="/legal/terms" className="bd-link">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/legal/privacy" className="bd-link">
                        Privacy Policy
                      </Link>{" "}
                      and confirm I am 18+.
                    </span>
                  </label>

                  {!agreeTerms && agreeTouched ? (
                    <p className="mt-2 text-xs font-semibold text-red-700">
                      You must accept the Terms and Privacy Policy to create an account.
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cx("bd-btn bd-btn-primary w-full", loading && "opacity-70 cursor-not-allowed")}
                  >
                    {loading ? "Creating..." : "Create free account"}
                  </button>

                  <div className="text-sm text-black/60">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="bd-link font-semibold">
                      Log in
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
