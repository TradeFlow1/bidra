"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function RegisterPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [country, setCountry] = useState("AU");
  const [postcode, setPostcode] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const pwTooShort = useMemo(() => password.length > 0 && password.length < 8, [password]);
  const pwMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [password, confirmPassword]
  );

  const canSubmit = useMemo(() => {
    const emailOk = email.trim().length > 0;
    const userOk = username.trim().length >= 3;
    const dobOk = dob.trim().length > 0;
    const pwOk = password.length >= 8;
    const confirmOk = confirmPassword.length >= 8 && password === confirmPassword;
    const locationOk =
      postcode.trim().length > 0 || (suburb.trim().length > 0 && state.trim().length > 0);

    return emailOk && userOk && dobOk && pwOk && confirmOk && locationOk && termsAccepted && !busy;
  }, [email, username, dob, password, confirmPassword, postcode, suburb, state, termsAccepted, busy]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-extrabold text-[var(--bidra-fg)]">Create account</h1>
      <p className="mt-2 text-sm text-[var(--bidra-muted)]">
        Accounts are 18+ only. You'll need to verify your email before becoming active.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <div className="font-semibold">Fix this first:</div>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          if (!termsAccepted) {
            setError("You must accept the Terms and confirm you are 18+ to create an account.");
            return;
          }

          if (pwTooShort) {
            setError("Password must be at least 8 characters.");
            return;
          }
          if (!confirmPassword) {
            setError("Please confirm your password.");
            return;
          }
          if (pwMismatch) {
            setError("Passwords do not match.");
            return;
          }
          if (!canSubmit) {
            setError("Please complete all required fields.");
            return;
          }

          setBusy(true);
          try {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: email.trim(),
                password,
                username: username.trim(),
                dob,
                country,
                postcode: postcode.trim(),
                suburb: suburb.trim(),
                state: state.trim(),
                termsAccepted: true,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(String(data?.error || `Register failed (HTTP ${res.status})`));
              return;
            }

            router.push("/signin");
            router.refresh();
          } catch (err: any) {
            setError(String(err?.message || err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <label className="text-sm font-medium">Email *</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password (min 8 chars) *</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          {pwTooShort ? (
            <p className="mt-1 text-xs font-semibold text-red-700">Must be at least 8 characters.</p>
          ) : (
            <p className="mt-1 text-xs text-[var(--bidra-muted)]">Use 8+ characters.</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Confirm password *</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border p-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          {pwMismatch ? (
            <p className="mt-1 text-xs font-semibold text-red-700">Passwords do not match.</p>
          ) : (
            <p className="mt-1 text-xs text-[var(--bidra-muted)]">Must match your password.</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Username (3-24) *</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
          />
          <p className="mt-1 text-xs text-[var(--bidra-muted)]">Letters, numbers, underscore, dot.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Date of birth *</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border p-2"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Country</label>
            <input className="mt-1 w-full rounded-md border p-2" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Postcode</label>
            <input className="mt-1 w-full rounded-md border p-2" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. 4000" />
            <p className="mt-1 text-xs text-[var(--bidra-muted)]">Use postcode OR suburb + state.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Suburb</label>
            <input className="mt-1 w-full rounded-md border p-2" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Optional if postcode supplied" />
          </div>
          <div>
            <label className="text-sm font-medium">State</label>
            <input className="mt-1 w-full rounded-md border p-2" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. QLD" />
          </div>
        </div>

        <div className="rounded-md border p-3">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              I agree to Bidra&apos;s{" "}
              <Link href="/legal/terms" className="text-[var(--bidra-link)] underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-[var(--bidra-link)] underline">
                Privacy Policy
              </Link>{" "}
              and confirm I am 18+.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cx(
            "rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60",
            !canSubmit && "cursor-not-allowed"
          )}
        >
          {busy ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-[var(--bidra-muted)]">
          Already have an account?{" "}
          <Link href="/signin" className="text-[var(--bidra-link)] underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
