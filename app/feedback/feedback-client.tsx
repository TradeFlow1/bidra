"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SessionUser = { id?: string; role?: string } | null;
type SessionShape = { user?: SessionUser } | null;

export default function FeedbackClient() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");

  // honeypot
  const [website, setWebsite] = useState("");

  const pageUrl = useMemo(() => {
    try { return window.location.href; } catch { return ""; }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const json = (await res.json()) as SessionShape;

        const hasUser = !!json?.user;
        const role = (json?.user as any)?.role ? String((json?.user as any).role) : "";

        if (!alive) return;
        setSignedIn(hasUser);
        setIsAdmin(role === "ADMIN");
      } catch {
        if (!alive) return;
        setSignedIn(false);
        setIsAdmin(false);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  async function submit() {
    setStatus("");
    const msg = (message || "").trim();
    if (!msg) {
      setStatus("Please enter a message.");
      return;
    }

    try {
      const res = await fetch("/api/feedback/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: msg,
          pageUrl,
          email: signedIn ? "" : (email || "").trim(),
          website, // honeypot
        }),
      });

      const j = await res.json().catch(() => null as any);
      if (!res.ok) {
        setStatus(j?.error ? String(j.error) : "Failed to send feedback.");
        return;
      }

      setMessage("");
      setEmail("");
      setStatus("Thanks — we received your feedback.");
    } catch {
      setStatus("Failed to send feedback.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Feedback</h1>
          <p className="mt-2 bd-ink2">
            Tell us what’s confusing, broken, or missing. Include steps to reproduce if you can.
          </p>
        </div>

        {isAdmin ? (
          <div className="flex gap-2">
            <Link href="/admin/feedback" className="bd-btn bd-btn-outline">Admin: Feedback</Link>
            <Link href="/admin/events" className="bd-btn bd-btn-outline">Admin: Events</Link>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
        <div className="text-sm font-extrabold bd-ink">Send feedback</div>

        {loading ? (
          <div className="mt-4 text-sm bd-ink2">Loading…</div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Honeypot (hidden) */}
            <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label>Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold bd-ink">Category (optional)</label>
              <select
                className="mt-1 w-full rounded-xl border bd-bd px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Choose…</option>
                <option value="Bug">Bug</option>
                <option value="UX">UX / confusing</option>
                <option value="Feature">Feature request</option>
                <option value="Trust & Safety">Trust & Safety</option>
                <option value="Payments / Orders">Payments / Orders</option>
                <option value="Messaging">Messaging</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {!signedIn ? (
              <div>
                <label className="text-xs font-semibold bd-ink">Email (optional)</label>
                <input
                  className="mt-1 w-full rounded-xl border bd-bd px-3 py-2"
                  placeholder="If you want a reply"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : null}

            <div>
              <label className="text-xs font-semibold bd-ink">Message</label>
              <textarea
                className="mt-1 w-full min-h-[160px] rounded-xl border bd-bd px-3 py-2"
                placeholder="What happened? What did you expect? Steps to reproduce?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="bd-btn bd-btn-solid" onClick={submit}>
                Send feedback
              </button>
              <Link href="/support" className="bd-btn bd-btn-outline">Support &amp; Safety</Link>
              <Link href="/contact" className="bd-btn bd-btn-outline">Contact</Link>
            </div>

            {status ? (
              <div className="text-sm bd-ink2" aria-live="polite">{status}</div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs bd-ink2">
        Note: Bidra is a platform only and is not the seller of items listed.
      </div>
    </div>
  );
}
