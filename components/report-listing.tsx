"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
const REASONS = [
  { value: "PROHIBITED_ITEM", label: "Prohibited item" },
  { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
  { value: "MISLEADING", label: "Misleading or false information" },
  { value: "OFFENSIVE", label: "Offensive content" },
  { value: "SAFETY_RISK", label: "Safety risk" },
  { value: "OTHER", label: "Other" },
];

export default function ReportListing({
  listingId,
  compact,
}: {
  listingId: string;
  compact?: boolean;
}) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const reasonIsValid = useMemo(() => {
    return REASONS.some((r) => r.value === reason);
  }, [reason]);

  async function submit() {
    // If not authenticated, let the API return 401 and we redirect to login (keeps single source of truth)
    if (!reasonIsValid) {
      setMsg("Please choose a reason.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason,
          details: details.trim() ? details.trim() : "",
        }),
      });

      // 401: send to login, then come back to this listing
      if (res.status === 401) {
        router.push("/auth/login?next=" + encodeURIComponent("/listings/" + listingId));
        return;
      }

      // 403: age/restriction gate
      if (res.status === 403) {
        router.push("/account/restrictions");
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const reasonCode = String((data as any)?.reason || "").toUpperCase();
        if (
          reasonCode.includes("AGE") ||
          reasonCode.includes("UNDER") ||
          reasonCode.includes("VERIFY") ||
          reasonCode.includes("RESTRICT")
        ) {
          router.push("/account/restrictions");
          return;
        }

        const errMsg = String((data as any)?.error || "");
        throw new Error(errMsg ? errMsg : "Report failed (" + String(res.status) + ")");
      }

      setMsg("Report submitted. Thanks - we'll review it.");
      setOpen(false);
      setDetails("");
      setReason("");
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const btn: CSSProperties = {
    padding: compact ? "8px 10px" : "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  };

  const primary: CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };

  const dangerText: CSSProperties = { fontSize: 13, fontWeight: 800, color: "#b91c1c" };

  return (
    <div>
      <button
        type="button"
        style={btn}
        onClick={() => {
          setOpen((v) => !v);
          setMsg("");
        }}
      >
        Report
      </button>

      {open ? (
        <div
          style={{
            marginTop: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            maxWidth: 560,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Report this listing</div>

          {!isAuthed ? (
            <div style={{ ...dangerText, marginBottom: 10 }}>
              Not authenticated.{" "}
              <Link href="/auth/login" style={{ textDecoration: "underline" }}>
                Log in
              </Link>{" "}
              to report a listing.
            </div>
          ) : null}

          <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Reason</div>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: 14,
            }}
          >
            <option value="" disabled>
              Choose a reason...
            </option>

            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div style={{ fontSize: 12, fontWeight: 900, marginTop: 12, marginBottom: 6 }}>
            Details (optional)
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add details that help review (optional)"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: 14,
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={submit}
              disabled={busy || !isAuthed || !reasonIsValid}
              style={{
                ...primary,
                opacity: busy || !isAuthed || !reasonIsValid ? 0.6 : 1,
              }}
            >
              Submit report
            </button>

            <button type="button" onClick={() => setOpen(false)} disabled={busy} style={btn}>
              Cancel
            </button>
          </div>

          {msg ? (
            <div
              style={{
                marginTop: 10,
                ...(msg.toLowerCase().includes("submitted")
                  ? { color: "#166534" }
                  : dangerText),
              }}
            >
              {msg}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
