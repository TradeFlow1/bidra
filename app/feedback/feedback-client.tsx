"use client";

import StatusMessage from "@/components/status-message";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import { useEffect, useMemo, useState } from "react";

type SessionUser = { id?: string; role?: string } | null;
type SessionShape = { user?: SessionUser } | null;

export default function FeedbackClient() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info" | "warning">("info");

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
        if (!alive) return;
        setSignedIn(hasUser);      } catch {
        if (!alive) return;
        setSignedIn(false);      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  async function submit() {
    setStatus("");
    setStatusTone("info");
    const msg = (message || "").trim();
    if (!msg) {
      setStatusTone("error");
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
        setStatusTone("error");
        setStatus("We could not send your feedback. Please check your message and try again.");
        return;
      }

      setMessage("");
      setEmail("");
      setStatusTone("success");
      setStatus("Thanks - we received your feedback.");
    } catch {
      setStatusTone("error");
      setStatus("We could not send your feedback. Please try again shortly.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight bd-ink">Feedback</h2>
          <p className="mt-2 bd-ink2">
            Tell us what is confusing, broken, or missing.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
        <div className="text-sm font-extrabold bd-ink">Send feedback</div>

        {loading ? (
          <div className="mt-4 text-sm bd-ink2">Checking your feedback options...</div>
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
                <option value="">Choose...</option>
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
                placeholder="What happened? What should change?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <BidraButton type="button" variant="secondary" fullWidth className="sm:w-auto" onClick={submit}>
                Send feedback
              </BidraButton>
            </div>

            {status ? <StatusMessage tone={statusTone}>{status}</StatusMessage> : null}
          </div>
        )}
      </div>
    </div>
  );
}

