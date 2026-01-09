"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [country, setCountry] = useState("AU");
  const [postcode, setPostcode] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-extrabold text-[var(--bidra-fg)]">Create account</h1>
      <p className="mt-2 text-sm text-[var(--bidra-muted)]">
        Accounts are 18+ only. Youâ€™ll need to verify your email before becoming active.
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

          setBusy(true);
          try {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                password,
                username,
                dob,
                country,
                postcode,
                suburb,
                state,
                termsAccepted: true,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(String(data?.error || `Register failed (HTTP ${res.status})`));
              return;
            }

            // After register, send them to sign-in (or home)
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
          <input className="mt-1 w-full rounded-md border p-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Password (min 8 chars) *</label>
          <input type="password" className="mt-1 w-full rounded-md border p-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Username (3-24) *</label>
          <input className="mt-1 w-full rounded-md border p-2" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <p className="mt-1 text-xs text-[var(--bidra-muted)]">Letters, numbers, underscore, dot.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Date of birth *</label>
          <input type="date" className="mt-1 w-full rounded-md border p-2" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Country</label>
            <input className="mt-1 w-full rounded-md border p-2" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Postcode</label>
            <input className="mt-1 w-full rounded-md border p-2" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. 4000" />
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
              I agree to the Terms and Conditions and confirm I am 18+.
              {" "}
              <Link href="/legal" className="text-[var(--bidra-link)] underline">
                View Legal Pack
              </Link>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
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
