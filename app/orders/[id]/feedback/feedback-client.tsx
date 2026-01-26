"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  listingTitle: string;
  roleLabel: string;
  otherPartyLabel: string;
  alreadySubmitted: boolean;
  orderOutcome: string;
};

export default function FeedbackClient({
  orderId,
  listingTitle,
  roleLabel,
  otherPartyLabel,
  alreadySubmitted,
  orderOutcome,
}: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    alreadySubmitted ? "done" : "idle"
  );
  const [error, setError] = useState<string>("");
  const router = useRouter();

  async function submit() {
    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Duplicate feedback (already submitted) should not look like a failure
        if (res.status === 409) {
          setStatus("done");
      // Redirect back to the order page (fix wrong-page redirect)
      setTimeout(() => {
        try {
          router.push(`/orders/${orderId}`);
          router.refresh();
        } catch {}
      }, 800);
          setError("");
          return;
        }

        setStatus("error");
        setError(data?.error || (data?.reason ? `Not allowed: ${data.reason}` : `Request failed (${res.status})`));
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setError("Failed to submit feedback.");
    }
  }

  const card: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    padding: 16,
    background: "#fff",
  };

  const pill = (text: string, bg: string) => (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {text}
    </span>
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Leave feedback</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
              You are leaving feedback as the <b>{roleLabel}</b> for: <b>{listingTitle}</b>.
            </div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
              You are reviewing the <b>{otherPartyLabel}</b>.
            </div>
          </div>
          <div style={{ alignSelf: "flex-start" }}>
            {orderOutcome === "COMPLETED"
              ? pill("Completed", "#e6ffea")
              : pill("In progress", "#eef2ff")}
          </div>
        </div>
      </div>

      <div style={card}>
        {status === "done" ? (
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>✅ Feedback submitted</div>
            <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.8 }}>
              Thanks — your feedback has been recorded.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label htmlFor="feedback-rating" style={{ fontWeight: 800, display: "block" }}>Rating (1–5)</label>
              <select id="feedback-rating" name="rating" aria-label="Rating (1 to 5)" aria-describedby={status === "error" ? "feedback-error" : undefined} className="focus:outline-none focus:ring-2 focus:ring-black/30"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option value={n} key={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="feedback-comment" style={{ fontWeight: 800, display: "block" }}>Comment (optional)</label>
              <textarea id="feedback-comment" name="comment" aria-label="Comment" aria-describedby={status === "error" ? "feedback-error" : undefined} className="focus:outline-none focus:ring-2 focus:ring-black/30"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Optional comment…"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.15)",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={submit}
              disabled={status === "saving"}
              style={{
                width: 220,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#2563eb",
                color: "white",
                fontWeight: 900,
                cursor: status === "saving" ? "not-allowed" : "pointer",
              }}
            >
              {status === "saving" ? "Submitting…" : "Submit feedback"}
            </button>

            {status === "error" ? (
              <div id="feedback-error" role="status" aria-live="polite" style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
