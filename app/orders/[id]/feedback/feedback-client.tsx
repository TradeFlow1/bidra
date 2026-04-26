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
  canSubmit: boolean;
};

export default function FeedbackClient({
  orderId,
  listingTitle,
  roleLabel,
  otherPartyLabel,
  alreadySubmitted,
  orderOutcome,
  canSubmit,
}: Props) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    alreadySubmitted ? "done" : "idle",
  );
  const [error, setError] = useState<string>("");
  const router = useRouter();

  function finishSuccess() {
    setStatus("done");
    setError("");
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        router.push(`/orders/${orderId}`);
        router.refresh();
      }, 900);
    }
  }

  async function submit() {
    if (!canSubmit) {
      setStatus("error");
      setError(
        orderOutcome === "COMPLETED"
          ? "Feedback has already been submitted for this order."
          : "Only completed orders can be rated.",
      );
      return;
    }

    if (!(rating >= 1 && rating <= 5)) {
      setStatus("error");
      setError("Please choose a rating from 1 to 5 stars.");
      return;
    }

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
        if (res.status === 409) {
          finishSuccess();
          return;
        }

        setStatus("error");
        setError(data?.error || (data?.reason ? `Not allowed: ${data.reason}` : `Request failed (${res.status})`));
        return;
      }

      if (data?.alreadySubmitted) {
        finishSuccess();
        return;
      }

      finishSuccess();
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
            <div style={{ fontSize: 18, fontWeight: 900 }}>Rate this transaction</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
              You are leaving feedback as the <b>{roleLabel}</b> for: <b>{listingTitle}</b>.
            </div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
              You are reviewing the <b>{otherPartyLabel}</b>.
            </div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
              Honest feedback helps buyers and sellers make safer decisions.
            </div>
          </div>
          <div style={{ alignSelf: "flex-start" }}>
            {orderOutcome === "COMPLETED" ? pill("Completed", "#e6ffea") : pill("In progress", "#eef2ff")}
          </div>
        </div>
      </div>

      <div style={card}>
        {status === "done" ? (
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Feedback submitted</div>
            <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.8 }}>Thanks — your feedback has been recorded.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div id="feedback-rating" style={{ fontWeight: 800, display: "block" }}>
                Rating (1–5)
              </div>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="feedback-rating">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = rating === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRating(n)}
                      className="rounded-lg border px-3 py-2 text-sm font-bold"
                      style={{
                        borderColor: selected ? "#1d4ed8" : "rgba(0,0,0,0.15)",
                        background: selected ? "#eff6ff" : "#fff",
                        color: selected ? "#1e40af" : "#111827",
                      }}
                    >
                      {"★".repeat(n)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="feedback-comment" style={{ fontWeight: 800, display: "block" }}>
                Comment (optional)
              </label>
              <textarea
                id="feedback-comment"
                name="comment"
                aria-label="Comment"
                aria-describedby={status === "error" ? "feedback-error" : undefined}
                className="focus:outline-none focus:ring-2 focus:ring-black/30"
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
              disabled={status === "saving" || !canSubmit}
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
              {status === "saving" ? "Submitting..." : "Submit feedback"}
            </button>

            {!canSubmit ? (
              <div className="text-sm text-neutral-600" aria-live="polite">
                {orderOutcome === "COMPLETED"
                  ? "Feedback submitted already for this order."
                  : "Only completed orders can be rated."}
              </div>
            ) : null}

            {status === "error" ? (
              <div id="feedback-error" role="status" aria-live="polite" style={{ color: "#b91c1c", fontWeight: 700 }}>
                {error}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
