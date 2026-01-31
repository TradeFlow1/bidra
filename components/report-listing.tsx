"use client";

import Link from "next/link";
import { ClickableLink } from "@/components/clickable-link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

      if (res.status === 401) {
        router.push("/auth/login?next=" + encodeURIComponent("/listings/" + listingId));
        return;
      }

      if (res.status === 403) {
        router.push("/account/restrictions");
        return;
      }

      const data = await res.json().catch(() => ({} as unknown));

      if (!res.ok) {
        const reasonCode = String((data as unknown as { reason?: unknown })?.reason ?? "").toUpperCase();
        if (
          reasonCode.includes("AGE") ||
          reasonCode.includes("UNDER") ||
          reasonCode.includes("VERIFY") ||
          reasonCode.includes("RESTRICT")
        ) {
          router.push("/account/restrictions");
          return;
        }

        const errMsg = String((data as unknown as { error?: unknown })?.error ?? "");
        throw new Error(errMsg ? errMsg : "Report failed (" + String(res.status) + ")");
      }

      setMsg("Report submitted. Thanks — we’ll review it.");
      setOpen(false);
      setDetails("");
      setReason("");
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const triggerClass = compact ? "bd-btn bd-btn-ghost !px-3 !py-2" : "bd-btn bd-btn-ghost";

  return (
    <div>
      <button
        type="button"
        className={triggerClass}
        onClick={() => {
          setOpen((v) => !v);
          setMsg("");
        }}
      >
        Report
      </button>

      {open ? (
        <div className="bd-card mt-3 p-4 space-y-3" style={{ maxWidth: 560 }}>
          <div className="text-base font-extrabold">Report this listing</div>

          {!isAuthed ? (
            <div className="text-sm font-bold text-red-700">
              Not authenticated.{" "}
              <Link href="/auth/login" className="underline">
                Log in
              </Link>{" "}
              to report a listing.
            </div>
          ) : null}

          <div className="space-y-1">
            <div className="text-xs font-extrabold">Reason</div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
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
          </div>

          <div className="space-y-1">
            <div className="text-xs font-extrabold">Details (optional)</div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add details that help review (optional)"
              rows={3}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !isAuthed || !reasonIsValid}
              className="bd-btn bd-btn-primary"
              style={{ opacity: busy || !isAuthed || !reasonIsValid ? 0.6 : 1 }}
            >
              Submit report
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="bd-btn bd-btn-ghost"
              style={{ opacity: busy ? 0.6 : 1 }}
            >
              Cancel
            </button>
          </div>

          {msg ? (
            <div
              className={
                msg.toLowerCase().includes("submitted") ? "text-sm font-bold text-green-800" : "text-sm font-bold text-red-700"
              }
            >
              {msg}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
