"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  dob: string; // yyyy-mm-dd
  postcode: string;
  suburb: string;
  state: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTouched, setAgreeTouched] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const hasPostcode = useMemo(() => form.postcode.trim().length > 0, [form.postcode]);
  const pwTooShort = useMemo(() => form.password.length > 0 && form.password.length < 8, [form.password]);
  const pwMismatch = useMemo(
    () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword,
    [form.password, form.confirmPassword]
  );

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().length > 0;
    const userOk = form.username.trim().length >= 3;
    const dobOk = form.dob.trim().length > 0;
    const pwOk = form.password.length >= 8;
    const confirmOk = form.confirmPassword.length >= 8 && form.password === form.confirmPassword;
    // keep existing location rule: postcode OR suburb+state
    const locationOk = (form.postcode.trim().length > 0) || (form.suburb.trim().length > 0 && form.state.trim().length > 0);
    return emailOk && userOk && dobOk && pwOk && confirmOk && locationOk && agreeTerms && !loading;
  }, [form, agreeTerms, loading]);

  const hasSuburbState = useMemo(
    () => form.suburb.trim().length > 0 || form.state.trim().length > 0,
    [form.suburb, form.state]
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
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

    // STEP 1A: client-side guard (still validate server-side too)
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
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      setError(data?.error || "Registration failed");
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
  }

  const shell = "bd-container py-6 pb-14";
  const card = "bd-card p-6 sm:p-8 max-w-[560px] mx-auto";
  const label = "text-sm font-semibold text-[#0b1220]";
  const helper = "mt-1 text-xs text-black/55";
  const input =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5";

  return (
    <main className={shell}>
      <div className={card}>
        <h1 className="text-2xl font-extrabold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-black/60">
          Bidra accounts are <span className="font-semibold text-[#0b1220]">18+</span>. Under 18s may browse but
          cannot create accounts.
        </p>

        {ok ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-lg font-extrabold text-[#0b1220]">Account created ✅</p>
            <p className="mt-1 text-sm text-black/60">
              Please verify your email to activate your account.
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
            {error ? (
              <div className="mt-6 rounded-2xl border border-red-600/20 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label className={label}>Email</label>
                <input
                  className={input}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Password</label>
                  <input
                    className={input}
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => {
                      set("password", e.target.value);
                      // keep confirm in sync UX: if user edits password after confirming, mismatch will show
                    }}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <p className={helper}>Use 8+ characters.</p>
                  {pwTooShort ? (
                    <p className="mt-1 text-xs font-semibold text-red-700">Must be at least 8 characters.</p>
                  ) : null}
                </div>

                <div>
                  <label className={label}>Confirm password</label>
                  <input
                    className={input}
                    type="password"
                    required
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
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
                  onChange={(e) => set("username", e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
                <p className={helper}>Letters, numbers, underscore, dot.</p>
              </div>

              <div>
                <label className={label}>Date of birth</label>
                <input
                  className={input}
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
                <p className={helper}>Used only to enforce 18+.</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-[#0b1220]">Location</p>
                  <p className="text-xs text-black/55">Country: AU</p>
                </div>
                <p className="mt-1 text-sm text-black/60">Use postcode OR suburb + state.</p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className={label}>Postcode</label>
                    <input
                      className={cx(input, hasSuburbState && "opacity-60")}
                      disabled={hasSuburbState}
                      value={form.postcode}
                      onChange={(e) => {
                        const v = e.target.value;
                        set("postcode", v);
                        if (v.trim()) {
                          set("suburb", "");
                          set("state", "");
                        }
                      }}
                      placeholder="Postcode"
                      inputMode="numeric"
                    />
                    <p className={helper}>
                      {hasSuburbState ? "Clear suburb/state to use postcode." : "Fastest option."}
                    </p>
                  </div>

                  <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                    <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-black/55">
                      OR
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className={label}>Suburb</label>
                    <input
                      className={cx(input, hasPostcode && "opacity-60")}
                      disabled={hasPostcode}
                      value={form.suburb}
                      onChange={(e) => {
                        const v = e.target.value;
                        set("suburb", v);
                        if (v.trim()) set("postcode", "");
                      }}
                      placeholder="Suburb"
                    />

                    <label className={cx(label, "mt-3 block")}>State</label>
                    <input
                      className={cx(input, hasPostcode && "opacity-60")}
                      disabled={hasPostcode}
                      value={form.state}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase();
                        set("state", v);
                        if (v.trim()) set("postcode", "");
                      }}
                      placeholder="State (e.g. NSW)"
                    />
                    <p className={helper}>Example: QLD, NSW, VIC</p>
                  </div>
                </div>
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
                {loading ? "Creating..." : "Create account"}
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
    </main>
  );
}
