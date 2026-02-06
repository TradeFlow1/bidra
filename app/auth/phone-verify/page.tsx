"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function e164Hint(v: string) {
  const s = (v ?? "").trim();
  if (s.startsWith("+")) return s;
  if (s.startsWith("04")) return "+61" + s.slice(1);
  return s;
}

export default function PhoneVerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function sendCode() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/phone/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch((): unknown => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to send code");
      setSent(true);
    } catch (e: any) {
      setError(String(e?.message || "Failed to send code"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/phone/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch((): unknown => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to verify code");
      setOk(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 350);
    } catch (e: any) {
      setError(String(e?.message || "Failed to verify code"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 sm:p-8 max-w-[560px] mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight bd-ink">Verify your phone</h1>
        <p className="mt-2 text-sm bd-ink2">
          Phone verification is required before you can list, make offers, or message.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-600/20 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {ok ? (
          <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-lg font-extrabold bd-ink">Phone verified ✅</div>
            <p className="mt-1 text-sm bd-ink2">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold bd-ink">Mobile number</label>
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="04xx xxx xxx or +61..."
                inputMode="tel"
                autoComplete="tel"
              />
              <p className="mt-1 text-xs text-black/55">
                Tip: {phone ? `We’ll send to: ${e164Hint(phone)}` : "Use your AU mobile (04xx) or international + format."}
              </p>
            </div>

            {!sent ? (
              <button
                className="bd-btn bd-btn-primary w-full"
                disabled={busy || phone.trim().length < 8}
                onClick={sendCode}
              >
                {busy ? "Sending…" : "Send code"}
              </button>
            ) : (
              <>
                <div>
                  <label className="text-sm font-semibold bd-ink">Code</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter the SMS code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  className="bd-btn bd-btn-primary w-full"
                  disabled={busy || code.trim().length < 3}
                  onClick={confirmCode}
                >
                  {busy ? "Verifying…" : "Verify phone"}
                </button>

                <button className="bd-btn w-full" disabled={busy} onClick={sendCode}>
                  Resend code
                </button>
              </>
            )}

            <div className="pt-2 text-xs text-black/60">
              Need help? <Link href="/support" className="bd-link">Contact support</Link>.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

