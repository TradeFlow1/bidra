"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
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
const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    username: "",
    dob: "",
    postcode: "",
    suburb: "",
    state: "",
  });

  const hasPostcode = useMemo(() => form.postcode.trim().length > 0, [form.postcode]);
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

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Registration failed");
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
  }

  const shell =
    "min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10";
  const card =
    "mx-auto w-full max-w-[520px] rounded-2xl border border-white/10 bg-white/[0.06] text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur";
  const input =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-[var(--bidra-blue)] focus:ring-4 focus:ring-[var(--bidra-blue)]/20";
  const label = "text-sm font-semibold text-white/85";
  const helper = "mt-1 text-xs text-white/60";
  const sectionTitle = "text-xs font-bold uppercase tracking-wider text-white/50";

  return (
    <div className={shell}>
      <div className={card}>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {/* Use your existing logo file. Do not change it. */}
              <img
                src="/brand/png/bidra_logo_2x.png"
                alt="Bidra"
                width={140}
                height={44}
                />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-white/65">
                Bidra accounts are <span className="font-semibold text-white">18+</span>.
                Under 18s may browse but cannot create accounts.
              </p>
            </div>
          </div>

          {/* Success */}
          {ok ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-lg font-bold">Account created ✅</p>
              <p className="mt-1 text-sm text-white/70">
                For MVP, the email verification link prints in the server console.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--bidra-blue)] px-4 py-2.5 font-extrabold text-black"
                >
                  Go to login
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white/90 hover:bg-white/10"
                >
                  Back to Browse
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error */}
              {error ? (
                <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={sectionTitle}>Quick setup</p>
                  <p className="mt-1 text-sm text-white/70">
                    Create an account in under a minute. You can complete verification later.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={label}>Email</label>
                    <input
                      className={input}
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
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
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                      />
                      <p className={helper}>Use 8+ characters. You can reset later.</p>
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
                        placeholder="e.g. hayden_markus"
                        autoComplete="username"
                      />
                      <p className={helper}>Letters, numbers, underscore, dot.</p>
                    </div>
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
                    <p className={helper}>We use this to enforce 18+ only.</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-extrabold">Location</p>
                      <p className="text-xs text-white/55">Country: AU (MVP)</p>
                    </div>
                    <p className="mt-1 text-sm text-white/65">
                      Use <span className="font-semibold text-white">postcode</span> OR{" "}
                      <span className="font-semibold text-white">suburb + state</span>.
                    </p>

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
                          placeholder="4301"
                          inputMode="numeric"
                        />
                        <p className={helper}>
                          {hasSuburbState ? "Clear suburb/state to use postcode." : "Fastest option."}
                        </p>
                      </div>

                      <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
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
                          placeholder="Redbank Plains"
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
                          placeholder="QLD"
                        />
                        <p className={helper}>Example: QLD, NSW, VIC</p>
                      </div>
                    </div>
                  </div>
                </div>                <label className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--bidra-blue)]"
                    required
                  />
                  <span>
                    I agree to Bidra's{" "}
                    <Link href="/legal/terms" className="underline underline-offset-4 text-[var(--bidra-blue)]">Terms</Link>{" "}
                    and{" "}
                    <Link href="/legal/privacy" className="underline underline-offset-4 text-[var(--bidra-blue)]">Privacy Policy</Link>{" "}
                    and confirm I am 18+.
                  </span>
                </label>



                <div className="flex flex-col gap-2 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
<Link
                    className="font-semibold text-[var(--bidra-blue)] underline underline-offset-4 text-[var(--bidra-blue)]"
                    href="/auth/login"
                  >
                    Already have an account? Log in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
